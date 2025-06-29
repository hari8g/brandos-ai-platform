#!/usr/bin/env bash
set -euo pipefail

echo "🔧 Starting full monorepo modularization…"

# 1) Remove old artifacts
echo "• Cleaning obsolete files…"
for f in .DS_Store DEPLOYMENT.md SYSTEM_SUMMARY.md app.log vercel.json build.sh; do
  if [ -e "$f" ]; then
    git rm -f "$f" && echo "  ‣ removed $f"
  fi
done

# 2) Create monorepo structure
echo "• Creating backend directory structure…"
backend_dirs=(
  backend/app/core
  backend/app/routers
  backend/app/services/assess
  backend/app/services/generate
  backend/app/services/costing
  backend/app/services/suppliers
  backend/app/services/compliance
  backend/app/models
  backend/app/utils
  backend/tests
)
for d in "${backend_dirs[@]}"; do
  mkdir -p "$d"
  touch "$d/__init__.py"
  echo "  ‣ $d/"
done

# 3) Migrate serverless functions into routers
echo "• Migrating serverless functions → backend/app/routers…"
if [ -d api ]; then
  mv api/assess.py    backend/app/routers/query.py
  mv api/formulate.py backend/app/routers/formulation.py
  rm -rf api
  echo "  ‣ api/assess.py → routers/query.py"
  echo "  ‣ api/formulate.py → routers/formulation.py"
fi

# 4) Move tests
echo "• Moving existing tests → backend/tests…"
if [ -f test_api_local.py ]; then
  mv test_api_local.py backend/tests/
  echo "  ‣ test_api_local.py"
fi

# 5) Patch vite.config.ts for static output & proxy
echo "• Patching frontend/vite.config.ts…"
VITE_CFG="frontend/vite.config.ts"
if [ -f "$VITE_CFG" ]; then
  sed -i.bak -E "s|outDir:.*|outDir: '../backend/static',|" "$VITE_CFG"
  if ! grep -q "proxy:" "$VITE_CFG"; then
    sed -i.bak "/build: *\{/a \ \ server: { proxy: { '/api': 'http://localhost:8000' } }," "$VITE_CFG"
  fi
  rm "$VITE_CFG.bak"
  echo "  ‣ patched build.outDir & proxy"
fi

# 6) Update root package.json scripts
echo "• Updating root package.json…"
if command -v jq >/dev/null 2>&1; then
  tmp=$(mktemp)
  jq '
    .scripts["build:frontend"] = "cd frontend && npm ci && npm run build" |
    .scripts["start:backend"]  = "uvicorn backend.app.main:app --host 0.0.0.0 --port 8000" |
    .scripts["start"]          = "npm run build:frontend && npm run start:backend" |
    del(.scripts.build)
  ' package.json >"$tmp" && mv "$tmp" package.json
  echo "  ‣ scripts: build:frontend, start:backend, start"
else
  echo "⚠️  Please install jq to auto-update package.json"
fi

# 7) Append to .gitignore
echo "• Appending .gitignore…"
cat <<EOF >> .gitignore

# Monorepo cleanup
/backend/static
.env
docker-compose.yml
EOF
echo "  ‣ gitignore updated"

# 8) Create Dockerfile
echo "• Ensuring Dockerfile exists…"
if [ ! -f Dockerfile ]; then
  cat > Dockerfile << 'EOF'
# Stage 1: build frontend
FROM node:18 AS frontend-build
WORKDIR /app/frontend
COPY frontend/package*.json ./
RUN npm ci
COPY frontend/ ./
RUN npm run build

# Stage 2: build backend
FROM python:3.10-slim
WORKDIR /app
COPY backend/requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt
COPY backend/ ./
COPY --from=frontend-build /app/frontend/dist ./static

ENV PORT=8000
CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000"]
EOF
  echo "  ‣ Dockerfile created"
else
  echo "  ‣ Dockerfile already exists, skipping"
fi

# 9) Create docker-compose.yml
echo "• Generating docker-compose.yml…"
cat > docker-compose.yml <<EOF
version: '3.8'

services:
  app:
    build: .
    ports:
      - "8000:8000"
    env_file:
      - .env
    volumes:
      - .:/app
EOF
echo "  ‣ docker-compose.yml created"

# 10) Create .env template
echo "• Creating .env template…"
if [ ! -f .env ]; then
  cat > .env <<EOF
# Mailchimp
MAILCHIMP_API_KEY=
MAILCHIMP_SERVER_PREFIX=
MAILCHIMP_AUDIENCE_ID=

# OpenAI
OPENAI_API_KEY=
EOF
  echo "  ‣ .env created"
else
  echo "  ‣ .env exists, skipping"
fi

# 11) Scaffold backend services with stubs
echo "• Scaffolding backend service modules…"

# assess service
cat > backend/app/services/assess/assess_service.py << 'EOF'
from ..models.assess import AssessRequest, AssessResponse

def assess_query(req: AssessRequest) -> AssessResponse:
    """
    Evaluate prompt quality.
    """
    # TODO: implement real logic
    return AssessResponse(score=0.5, can_generate=True)
EOF
# generate service
cat > backend/app/services/generate/generate_service.py << 'EOF'
from ..models.generate import GenerateRequest, GenerateResponse

def generate_formulation(req: GenerateRequest) -> GenerateResponse:
    """
    Call OpenAI / business logic to build formulation.
    """
    # TODO: implement real logic
    return GenerateResponse(ingredients=[], instructions="")
EOF
# costing service
cat > backend/app/services/costing/costing_service.py << 'EOF'
from ..models.costing import Formulation, CostEstimate

def estimate_cost(formulation: Formulation) -> CostEstimate:
    """
    Sum up unit costs, margin, taxes.
    """
    # TODO: implement real logic
    return CostEstimate(raw_materials=0.0, margin=0.0, total=0.0)
EOF
# suppliers service
cat > backend/app/services/suppliers/supplier_service.py << 'EOF'
from ..models.suppliers import SupplierRequest, SupplierResponse

def lookup_suppliers(req: SupplierRequest) -> SupplierResponse:
    """
    Return list of suppliers for ingredients.
    """
    # TODO: implement real logic
    return SupplierResponse(suppliers=[])
EOF
# compliance service
cat > backend/app/services/compliance/compliance_service.py << 'EOF'
from ..models.compliance import ComplianceRequest, ComplianceResponse

def check_compliance(req: ComplianceRequest) -> ComplianceResponse:
    """
    Validate pH ranges, regulatory limits.
    """
    # TODO: implement real logic
    return ComplianceResponse(is_compliant=True, issues=[])
EOF

echo "  ‣ backend services scaffolded"

# 12) Update formulation router to use new services
echo "• Updating backend/app/routers/formulation.py…"
cat > backend/app/routers/formulation.py << 'EOF'
from fastapi import APIRouter
from ..services.generate.generate_service import generate_formulation
from ..services.costing.costing_service import estimate_cost
from ..services.suppliers.supplier_service import lookup_suppliers
from ..services.compliance.compliance_service import check_compliance
from ..models.generate import GenerateRequest, GenerateResponse
from ..models.costing import CostEstimate
from ..models.suppliers import SupplierResponse
from ..models.compliance import ComplianceResponse

router = APIRouter()

@router.post("/generate", response_model=GenerateResponse)
def generate_endpoint(req: GenerateRequest):
    formulation = generate_formulation(req)
    # cost = estimate_cost(formulation)              # optionally include
    # suppliers = lookup_suppliers(SupplierRequest(...))
    # compliance = check_compliance(ComplianceRequest(...))
    return formulation
EOF
echo "  ‣ formulation router patched"

# 13) Modularize frontend components
echo "• Organizing frontend components…"
FE_ENGINE="frontend/src/components/FormulationEngine"
mkdir -p "$FE_ENGINE"

# Move existing
if [ -f frontend/src/components/PromptInput.tsx ]; then
  mv frontend/src/components/PromptInput.tsx "$FE_ENGINE/PromptInput.tsx"
  echo "  ‣ PromptInput.tsx → FormulationEngine/"
fi
if [ -f frontend/src/components/FormulationCard.tsx ]; then
  mv frontend/src/components/FormulationCard.tsx "$FE_ENGINE/FormulationCard.tsx"
  echo "  ‣ FormulationCard.tsx → FormulationEngine/"
fi

# New components
cat > "$FE_ENGINE/IngredientList.tsx" << 'EOF'
import React from 'react';
export default function IngredientList({ ingredients }: { ingredients: any[] }) {
  return (
    <div>
      <h3>Ingredients</h3>
      <ul>
        {ingredients.map((ing, i) => <li key={i}>{ing.name}: {ing.amount}</li>)}
      </ul>
    </div>
  );
}
EOF

cat > "$FE_ENGINE/CostSummary.tsx" << 'EOF'
import React from 'react';
export default function CostSummary({ cost }: any) {
  return (
    <div>
      <h3>Cost Estimate</h3>
      <p>Total: ₹{cost?.total}</p>
    </div>
  );
}
EOF

cat > "$FE_ENGINE/SupplierMap.tsx" << 'EOF'
import React from 'react';
export default function SupplierMap({ suppliers }: { suppliers: any[] }) {
  return (
    <div>
      <h3>Suppliers</h3>
      <ul>
        {suppliers.map((s, i) => <li key={i}>{s.name} – {s.location}</li>)}
      </ul>
    </div>
  );
}
EOF

cat > "$FE_ENGINE/index.ts" << 'EOF'
export { default as PromptInput } from './PromptInput';
export { default as FormulationCard } from './FormulationCard';
export { default as IngredientList } from './IngredientList';
export { default as CostSummary } from './CostSummary';
export { default as SupplierMap } from './SupplierMap';
EOF

echo "  ‣ created IngredientList, CostSummary, SupplierMap, barrel in FormulationEngine"

# 14) Create UI atoms folder
echo "• Scaffolding UI atoms…"
UI_DIR="frontend/src/components/UI"
mkdir -p "$UI_DIR"
cat > "$UI_DIR/Button.tsx" << 'EOF'
import React from 'react';
export default function Button(props: React.ButtonHTMLAttributes<HTMLButtonElement>) {
  return <button {...props} />;
}
EOF
cat > "$UI_DIR/Input.tsx" << 'EOF'
import React from 'react';
export default function Input(props: React.InputHTMLAttributes<HTMLInputElement>) {
  return <input {...props} />;
}
EOF
echo "  ‣ UI atoms Button, Input"

# 15) Scaffold hooks
echo "• Creating custom hooks…"
HOOKS_DIR="frontend/src/hooks"
mkdir -p "$HOOKS_DIR"
cat > "$HOOKS_DIR/useAssessQuery.ts" << 'EOF'
import { useState } from 'react'
import apiClient from '../services/apiClient'
export function useAssessQuery() {
  const [loading, setLoading] = useState(false)
  const [result, setResult]   = useState(null)
  async function assess(prompt: string) {
    setLoading(true)
    const res = await apiClient.post('/query/assess', { prompt })
    setResult(res.data)
    setLoading(false)
  }
  return { assess, result, loading }
}
EOF
cat > "$HOOKS_DIR/useGenerate.ts" << 'EOF'
import { useState } from 'react'
import apiClient from '../services/apiClient'
export function useGenerate() {
  const [loading, setLoading] = useState(false)
  const [data, setData]       = useState(null)
  async function generate(prompt: string) {
    setLoading(true)
    const res = await apiClient.post('/formulation/generate', { prompt })
    setData(res.data)
    setLoading(false)
  }
  return { generate, data, loading }
}
EOF
cat > "$HOOKS_DIR/useCosting.ts" << 'EOF'
import { useState } from 'react'
import apiClient from '../services/apiClient'
export function useCosting() {
  const [loading, setLoading] = useState(false)
  const [cost, setCost]       = useState(null)
  async function fetchCost(formulation: any) {
    setLoading(true)
    const res = await apiClient.post('/formulation/cost', formulation)
    setCost(res.data)
    setLoading(false)
  }
  return { fetchCost, cost, loading }
}
EOF
cat > "$HOOKS_DIR/useSuppliers.ts" << 'EOF'
import { useState } from 'react'
import apiClient from '../services/apiClient'
export function useSuppliers() {
  const [loading, setLoading]    = useState(false)
  const [suppliers, setSuppliers]= useState(null)
  async function fetchSuppliers(formulation: any) {
    setLoading(true)
    const res = await apiClient.post('/formulation/suppliers', formulation)
    setSuppliers(res.data)
    setLoading(false)
  }
  return { fetchSuppliers, suppliers, loading }
}
EOF

echo "  ‣ hooks: useAssessQuery, useGenerate, useCosting, useSuppliers"

# 16) Scaffold apiClient
echo "• Creating frontend API client…"
mkdir -p frontend/src/services
cat > frontend/src/services/apiClient.ts << 'EOF'
import axios from 'axios'
const apiClient = axios.create({ baseURL: '/api/v1' })
export default apiClient
EOF
echo "  ‣ apiClient.ts created"

# 17) Update imports in App.tsx
echo "• Updating App.tsx imports…"
APP_TSX="frontend/src/App.tsx"
if [ -f "$APP_TSX" ]; then
  sed -i.bak \
    -e "s|from './components/PromptInput'|from './components/FormulationEngine/PromptInput'|g" \
    -e "s|from './components/FormulationCard'|from './components/FormulationEngine/FormulationCard'|g" \
    "$APP_TSX" \
    && rm "${APP_TSX}.bak"
  echo "  ‣ App.tsx imports patched"
fi

echo "✅ All changes applied! Please review, commit, and push."
