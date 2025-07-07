"""
Response Streaming Service for Phase 2 Optimization
Provides streaming responses to reduce perceived latency and improve UX.
"""

import json
import asyncio
from typing import AsyncGenerator, Dict, Any, Optional
from dataclasses import dataclass
from enum import Enum
import logging

logger = logging.getLogger(__name__)

class StreamType(Enum):
    PROGRESSIVE = "progressive"  # Stream data as it's generated
    CHUNKED = "chunked"          # Stream in chunks
    BATCHED = "batched"          # Stream in batches

@dataclass
class StreamChunk:
    data: Any
    chunk_type: str
    progress: float
    is_complete: bool = False

class ResponseStreamingService:
    """
    Service for streaming API responses
    """
    
    def __init__(self, stream_type: StreamType = StreamType.PROGRESSIVE):
        self.stream_type = stream_type
        self.chunk_size = 1024  # Default chunk size
        self.batch_size = 5     # Default batch size
        
    async def stream_formulation_response(self, data: Dict[str, Any]) -> AsyncGenerator[StreamChunk, None]:
        """
        Stream formulation response progressively
        """
        # Stream ingredients first
        if "ingredients" in data:
            yield StreamChunk(
                data={"ingredients": data["ingredients"]},
                chunk_type="ingredients",
                progress=0.2
            )
            await asyncio.sleep(0.1)  # Small delay for UX
        
        # Stream manufacturing steps
        if "manufacturing_steps" in data:
            yield StreamChunk(
                data={"manufacturing_steps": data["manufacturing_steps"]},
                chunk_type="manufacturing",
                progress=0.4
            )
            await asyncio.sleep(0.1)
        
        # Stream quality control
        if "quality_control" in data:
            yield StreamChunk(
                data={"quality_control": data["quality_control"]},
                chunk_type="quality",
                progress=0.6
            )
            await asyncio.sleep(0.1)
        
        # Stream packaging
        if "packaging" in data:
            yield StreamChunk(
                data={"packaging": data["packaging"]},
                chunk_type="packaging",
                progress=0.8
            )
            await asyncio.sleep(0.1)
        
        # Stream final data
        yield StreamChunk(
            data=data,
            chunk_type="complete",
            progress=1.0,
            is_complete=True
        )
    
    async def stream_market_research_response(self, data: Dict[str, Any]) -> AsyncGenerator[StreamChunk, None]:
        """
        Stream market research response
        """
        # Stream TAM, SAM, TM
        market_metrics = {}
        for key in ["tam", "sam", "som"]:
            if key in data:
                market_metrics[key] = data[key]
        
        if market_metrics:
            yield StreamChunk(
                data={"market_metrics": market_metrics},
                chunk_type="market_metrics",
                progress=0.25
            )
            await asyncio.sleep(0.1)
        
        # Stream competitive landscape
        if "competitive_landscape" in data:
            yield StreamChunk(
                data={"competitive_landscape": data["competitive_landscape"]},
                chunk_type="competitive",
                progress=0.5
            )
            await asyncio.sleep(0.1)
        
        # Stream key trends
        if "key_trends" in data:
            yield StreamChunk(
                data={"key_trends": data["key_trends"]},
                chunk_type="trends",
                progress=0.75
            )
            await asyncio.sleep(0.1)
        
        # Stream final data
        yield StreamChunk(
            data=data,
            chunk_type="complete",
            progress=1.0,
            is_complete=True
        )
    
    async def stream_branding_response(self, data: Dict[str, Any]) -> AsyncGenerator[StreamChunk, None]:
        """
        Stream branding response
        """
        # Stream brand names
        if "brand_names" in data:
            yield StreamChunk(
                data={"brand_names": data["brand_names"]},
                chunk_type="brand_names",
                progress=0.2
            )
            await asyncio.sleep(0.1)
        
        # Stream brand strategy
        if "brand_strategy" in data:
            yield StreamChunk(
                data={"brand_strategy": data["brand_strategy"]},
                chunk_type="strategy",
                progress=0.4
            )
            await asyncio.sleep(0.1)
        
        # Stream social media strategy
        if "social_media_strategy" in data:
            yield StreamChunk(
                data={"social_media_strategy": data["social_media_strategy"]},
                chunk_type="social_media",
                progress=0.6
            )
            await asyncio.sleep(0.1)
        
        # Stream marketing messaging
        if "marketing_messaging" in data:
            yield StreamChunk(
                data={"marketing_messaging": data["marketing_messaging"]},
                chunk_type="messaging",
                progress=0.8
            )
            await asyncio.sleep(0.1)
        
        # Stream final data
        yield StreamChunk(
            data=data,
            chunk_type="complete",
            progress=1.0,
            is_complete=True
        )
    
    async def stream_costing_response(self, data: Dict[str, Any]) -> AsyncGenerator[StreamChunk, None]:
        """
        Stream costing response
        """
        # Stream CAPEX
        if "capex" in data:
            yield StreamChunk(
                data={"capex": data["capex"]},
                chunk_type="capex",
                progress=0.25
            )
            await asyncio.sleep(0.1)
        
        # Stream OPEX
        if "opex" in data:
            yield StreamChunk(
                data={"opex": data["opex"]},
                chunk_type="opex",
                progress=0.5
            )
            await asyncio.sleep(0.1)
        
        # Stream margins
        if "margins" in data:
            yield StreamChunk(
                data={"margins": data["margins"]},
                chunk_type="margins",
                progress=0.75
            )
            await asyncio.sleep(0.1)
        
        # Stream pricing
        if "pricing" in data:
            yield StreamChunk(
                data={"pricing": data["pricing"]},
                chunk_type="pricing",
                progress=0.9
            )
            await asyncio.sleep(0.1)
        
        # Stream final data
        yield StreamChunk(
            data=data,
            chunk_type="complete",
            progress=1.0,
            is_complete=True
        )
    
    async def stream_scientific_response(self, data: Dict[str, Any]) -> AsyncGenerator[StreamChunk, None]:
        """
        Stream scientific reasoning response
        """
        # Stream ingredient rationale
        if "ingredient_rationale" in data:
            yield StreamChunk(
                data={"ingredient_rationale": data["ingredient_rationale"]},
                chunk_type="ingredient_rationale",
                progress=0.2
            )
            await asyncio.sleep(0.1)
        
        # Stream consumer psychology
        if "consumer_psychology" in data:
            yield StreamChunk(
                data={"consumer_psychology": data["consumer_psychology"]},
                chunk_type="consumer_psychology",
                progress=0.4
            )
            await asyncio.sleep(0.1)
        
        # Stream regulatory compliance
        if "regulatory_compliance" in data:
            yield StreamChunk(
                data={"regulatory_compliance": data["regulatory_compliance"]},
                chunk_type="regulatory",
                progress=0.6
            )
            await asyncio.sleep(0.1)
        
        # Stream safety assessment
        if "safety_assessment" in data:
            yield StreamChunk(
                data={"safety_assessment": data["safety_assessment"]},
                chunk_type="safety",
                progress=0.8
            )
            await asyncio.sleep(0.1)
        
        # Stream final data
        yield StreamChunk(
            data=data,
            chunk_type="complete",
            progress=1.0,
            is_complete=True
        )

class StreamingMiddleware:
    """
    Middleware for handling streaming responses
    """
    
    def __init__(self, streaming_service: ResponseStreamingService):
        self.streaming_service = streaming_service
    
    async def stream_response(self, response_type: str, data: Dict[str, Any]) -> AsyncGenerator[Dict[str, Any], None]:
        """
        Stream response based on type
        """
        if response_type == "formulation":
            async for chunk in self.streaming_service.stream_formulation_response(data):
                yield self._format_chunk(chunk)
        elif response_type == "market_research":
            async for chunk in self.streaming_service.stream_market_research_response(data):
                yield self._format_chunk(chunk)
        elif response_type == "branding":
            async for chunk in self.streaming_service.stream_branding_response(data):
                yield self._format_chunk(chunk)
        elif response_type == "costing":
            async for chunk in self.streaming_service.stream_costing_response(data):
                yield self._format_chunk(chunk)
        elif response_type == "scientific":
            async for chunk in self.streaming_service.stream_scientific_response(data):
                yield self._format_chunk(chunk)
        else:
            # Default streaming
            yield {"data": data, "progress": 1.0, "complete": True}
    
    def _format_chunk(self, chunk: StreamChunk) -> Dict[str, Any]:
        """
        Format chunk for API response
        """
        return {
            "data": chunk.data,
            "chunk_type": chunk.chunk_type,
            "progress": chunk.progress,
            "complete": chunk.is_complete
        }

# Global streaming service instance
streaming_service = ResponseStreamingService()
streaming_middleware = StreamingMiddleware(streaming_service) 