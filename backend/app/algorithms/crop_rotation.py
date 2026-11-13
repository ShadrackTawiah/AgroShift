
"""
AgroShift Smart Crop Rotation Engine

Rule-based crop rotation prototype with optional NASA POWER
climate-context adjustments.

Scores are heuristic points, not probabilities or yield predictions.
Recommendations require local agronomic validation.
"""

CROP_DATABASE = {
    "maize": {
        "name": "Maize",
        "family": "grass",
        "type": "cereal",
        "nitrogen_demand": "high",
        "water_demand": "medium",
        "soil_benefit": "low",
        "drought_tolerance": "medium",
        "ghana_suitable": True,
    },
    "cowpea": {
        "name": "Cowpea",
        "family": "legume",
        "type": "legume",
        "nitrogen_demand": "low",
        "water_demand": "low",
        "soil_benefit": "high",
        "drought_tolerance": "high",
        "ghana_suitable": True,
    },
    "groundnut": {
        "name": "Groundnut",
        "family": "legume",
        "type": "legume",
        "nitrogen_demand": "low",
        "water_demand": "medium",
        "soil_benefit": "high",
        "drought_tolerance": "medium",
        "ghana_suitable": True,
    },
    "soybean": {
        "name": "Soybean",
        "family": "legume",
        "type": "legume",
        "nitrogen_demand": "low",
        "water_demand": "medium",
        "soil_benefit": "high",
        "drought_tolerance": "medium",
        "ghana_suitable": True,
    },
    "cassava": {
        "name": "Cassava",
        "family": "euphorbia",
        "type": "root",
        "nitrogen_demand": "medium",
        "water_demand": "low",
        "soil_benefit": "medium",
        "drought_tolerance": "high",
        "ghana_suitable": True,
    },
    "sorghum": {
        "name": "Sorghum",
        "family": "grass",
        "type": "cereal",
        "nitrogen_demand": "medium",
        "water_demand": "low",
        "soil_benefit": "low",
        "drought_tolerance": "high",
        "ghana_suitable": True,
    },
    "tomato": {
        "name": "Tomato",
        "family": "nightshade",
        "type": "vegetable",
        "nitrogen_demand": "high",
        "water_demand": "high",
        "soil_benefit": "low",
        "drought_tolerance": "low",
        "ghana_suitable": True,
    },
    "pepper": {
        "name": "Pepper",
        "family": "nightshade",
        "type": "vegetable",
        "nitrogen_demand": "medium",
        "water_demand": "medium",
        "soil_benefit": "low",
        "drought_tolerance": "medium",
        "ghana_suitable": True,
    },
    "okra": {
        "name": "Okra",
        "family": "mallow",
        "type": "vegetable",
        "nitrogen_demand": "medium",
        "water_demand": "medium",
        "soil_benefit": "medium",
        "drought_tolerance": "high",
        "ghana_suitable": True,
    },
}

PRIORITY_WEIGHTS = {
    "soil_improvement": {"soil_benefit": 4},
    "water_conservation": {"water_demand": 4},
    "drought_resilience": {"drought_tolerance": 4},
    "balanced": {
        "soil_benefit": 2,
        "water_demand": 2,
        "drought_tolerance": 2,
    },
}

WATER_SCORES = {
    "low": 3,
    "medium": 2,
    "high": 1,
}

BENEFIT_SCORES = {
    "low": 1,
    "medium": 2,
    "high": 3,
}


def climate_adjustment(crop, climate_summary):
    """
    Apply small heuristic adjustments using available climate context.

    Rainfall is the total over the supplied period, not a forecast.
    Temperature is the average over that period.
    These broad thresholds are prototype rules, not crop-specific
    planting thresholds.
    """

    adjustment = 0
    reasons = []

    if not isinstance(climate_summary, dict):
        return adjustment, reasons

    temperature = climate_summary.get("average_temperature")
    rainfall = climate_summary.get("total_rainfall")

    # Temperature context.
    if isinstance(temperature, (int, float)):
        if temperature >= 30:
            if crop["drought_tolerance"] == "high":
                adjustment += 2
                reasons.append(
                    "Higher average temperature gives a small preference "
                    "to crops with stronger drought tolerance."
                )
            elif crop["drought_tolerance"] == "low":
                adjustment -= 2
                reasons.append(
                    "Higher average temperature may increase stress risk "
                    "for crops with low drought tolerance."
                )

        elif temperature < 22:
            if crop["water_demand"] == "low":
                adjustment += 1
                reasons.append(
                    "Lower average temperature slightly favours "
                    "this crop in the prototype climate model."
                )

    # Rainfall context.
    if isinstance(rainfall, (int, float)):
        if rainfall < 500:
            if crop["water_demand"] == "low":
                adjustment += 3
                reasons.append(
                    "Lower rainfall over the climate period favours "
                    "considering crops with lower water demand."
                )
            elif crop["water_demand"] == "high":
                adjustment -= 3
                reasons.append(
                    "Lower rainfall over the climate period may challenge "
                    "crops with high water demand."
                )

        elif rainfall >= 1200:
            if crop["water_demand"] == "medium":
                adjustment += 1
                reasons.append(
                    "Higher rainfall over the climate period provides "
                    "some support for moderate water-demand crops."
                )

    return adjustment, reasons


def recommend_crop_rotation(
    previous_crop: str,
    priority: str = "balanced",
    water_availability: str = "medium",
    number_of_recommendations: int = 5,
    climate_summary=None,
):
    """
    Rank possible next crops using rotation rules and optional
    historical climate context.

    This is not a validated yield prediction or planting model.
    """

    previous_crop = previous_crop.lower().strip()
    priority = priority.lower().strip()
    water_availability = water_availability.lower().strip()

    if previous_crop not in CROP_DATABASE:
        raise ValueError(f"Unknown previous crop: {previous_crop}")

    if priority not in PRIORITY_WEIGHTS:
        raise ValueError(
            "Priority must be soil_improvement, water_conservation, "
            "drought_resilience, or balanced."
        )

    if water_availability not in ("low", "medium", "high"):
        raise ValueError(
            "Water availability must be low, medium, or high."
        )

    previous = CROP_DATABASE[previous_crop]
    weights = PRIORITY_WEIGHTS[priority]

    recommendations = []

    for crop_id, crop in CROP_DATABASE.items():
        if crop_id == previous_crop:
            continue

        score = 0
        reasons = []

        # Crop-family rotation.
        if crop["family"] != previous["family"]:
            score += 3
            reasons.append(
                "Different crop family from the previous crop."
            )
        else:
            score -= 3
            reasons.append(
                "Same crop family as the previous crop; rotation is less preferred."
            )

        # Legume benefit after a nitrogen-demanding crop.
        if (
            previous["nitrogen_demand"] == "high"
            and crop["type"] == "legume"
        ):
            score += 3
            reasons.append(
                "A legume may support nitrogen cycling in the rotation."
            )

        # Farmer priority.
        if "soil_benefit" in weights:
            score += (
                BENEFIT_SCORES[crop["soil_benefit"]]
                * weights["soil_benefit"]
            )

        if "water_demand" in weights:
            score += (
                WATER_SCORES[crop["water_demand"]]
                * weights["water_demand"]
            )

        if "drought_tolerance" in weights:
            score += (
                BENEFIT_SCORES[crop["drought_tolerance"]]
                * weights["drought_tolerance"]
            )

        # Farmer-reported water availability.
        if water_availability == "low":
            if crop["water_demand"] == "high":
                score -= 5
                reasons.append(
                    "High water demand may be unsuitable with limited water."
                )
            elif crop["water_demand"] == "low":
                score += 3
                reasons.append(
                    "Low water demand is favourable with limited water."
                )

        elif water_availability == "high":
            if crop["water_demand"] == "high":
                score += 1

        # NASA POWER climate-context adjustment.
        climate_score, climate_reasons = climate_adjustment(
            crop,
            climate_summary
        )
        score += climate_score
        reasons.extend(climate_reasons)

        recommendations.append({
            "crop_id": crop_id,
            "crop_name": crop["name"],
            "score": score,
            "reasons": reasons,
            "crop_details": crop,
            "climate_adjustment": climate_score,
        })

    recommendations.sort(
        key=lambda item: item["score"],
        reverse=True
    )

    return {
        "previous_crop": previous["name"],
        "priority": priority,
        "water_availability": water_availability,
        "climate_context_used": isinstance(climate_summary, dict),
        "recommendations": recommendations[
            :max(1, number_of_recommendations)
        ],
        "notice": (
            "Preliminary rule-based recommendations with broad "
            "historical climate adjustments. Climate observations "
            "are not forecasts. Confirm planting seasons, soil "
            "conditions, pest risks, and local agronomic guidance "
            "before planting."
        ),
    }
