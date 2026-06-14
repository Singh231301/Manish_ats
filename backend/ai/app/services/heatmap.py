from app.models.schemas import HeatmapZone

def compute_heatmap(parsed_resume: dict, job_description: str | None = None) -> list[HeatmapZone]:
    zones = []
    sections = parsed_resume.get("sections", [])
    
    jd_skills = []
    if job_description:
        # Simple extraction for now
        jd_skills = [w for w in job_description.lower().split() if len(w) > 3]
        
    for i, section in enumerate(sections):
        title = section.get("title", "")
        content = section.get("content", "")
        content_lower = content.lower()
        
        # Spatial heuristics based on section order
        if i == 0:
            page = 1
            position = "Header/Summary"
            attention_weight = 0.45
        elif i < len(sections) / 2:
            page = 1
            position = "Mid-body"
            attention_weight = 0.30
        elif i < len(sections) - 1:
            page = 2
            position = "Upper-body"
            attention_weight = 0.15
        else:
            page = 2
            position = "Footer"
            attention_weight = 0.10
            
        keyword_hits = sum(1 for skill in jd_skills if skill in content_lower) if jd_skills else len(content.split()) // 20
        word_count = max(len(content.split()), 1)
        density = min(1.0, keyword_hits / word_count * 10) # arbitrary multiplier for scaling
        
        # Base score + keyword density * weight
        base_score = 60 if len(content) > 100 else 40
        visibility_score = base_score + (density * 100 * attention_weight)
        visibility_score = min(100.0, max(0.0, visibility_score))
        
        status = "strong" if visibility_score >= 80 else "warning" if visibility_score >= 60 else "weak"
        
        zones.append(HeatmapZone(
            section=title,
            page=page,
            position=position,
            attention_weight=attention_weight,
            keyword_density=round(density, 3),
            visibility_score=round(visibility_score, 1),
            status=status
        ))
        
    return zones
