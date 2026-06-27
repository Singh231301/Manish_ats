from dataclasses import dataclass

@dataclass
class ATSProfile:
    name: str
    strip_tables: bool
    strip_formatting: bool
    requires_exact_keywords: bool
    missing_header_penalty: int
    column_flattening_risk: str # "high", "medium", "low"

ATS_PROFILES = {
    "workday": ATSProfile("Workday", True, True, False, 15, "high"),
    "taleo": ATSProfile("Taleo", False, False, True, 25, "medium"),
    "greenhouse": ATSProfile("Greenhouse", False, False, False, 5, "low"),
    "lever": ATSProfile("Lever", False, True, False, 5, "low"),
    "icims": ATSProfile("iCIMS", True, False, False, 20, "high"),
    "bamboohr": ATSProfile("BambooHR", False, False, False, 10, "medium"),
    "jazzhr": ATSProfile("JazzHR", False, False, False, 10, "medium"),
    "bullhorn": ATSProfile("Bullhorn", True, True, False, 15, "high"),
    "smartrecruiters": ATSProfile("SmartRecruiters", False, False, False, 5, "low"),
    "sap_successfactors": ATSProfile("SAP SuccessFactors", True, True, True, 20, "high"),
    "oracle_hcm": ATSProfile("Oracle HCM", True, True, True, 20, "high"),
    "jobvite": ATSProfile("Jobvite", False, False, False, 10, "medium"),
    "adp": ATSProfile("ADP", True, True, False, 15, "high"),
}

def simulate_ats(resume_text: str, ats_target: str, layout_issues: list[dict] = None) -> dict:
    profile = ATS_PROFILES.get(ats_target.lower(), ATS_PROFILES["workday"])
    layout_issues = layout_issues or []
    
    simulated_text = resume_text
    issues_flagged = []
    compatibility_score = 100
    
    has_tables = any(i["type"] == "tables" for i in layout_issues)
    has_columns = any(i["type"] == "layout" for i in layout_issues)
    
    if profile.strip_formatting:
        # Simulate stripping formatting (in plain text this is mostly removing extra newlines)
        simulated_text = "\n".join(line.strip() for line in simulated_text.splitlines() if line.strip())
        issues_flagged.append("Removed all styling and condensed spacing.")
        
    if profile.strip_tables and has_tables:
        compatibility_score -= 20
        issues_flagged.append("Table structures detected and flattened; content may be out of order.")
        # Actually flatten the text roughly
        simulated_text = simulated_text.replace("|", " ").replace("\t", " ")
        
    if profile.requires_exact_keywords:
        compatibility_score -= 10
        issues_flagged.append("Requires exact keyword matches; semantic synonyms may be ignored.")
        
    if profile.column_flattening_risk == "high" and has_columns:
        compatibility_score -= 25
        issues_flagged.append("High risk of multi-column content being flattened horizontally, breaking sentences.")
        # Scramble a bit of the text to simulate column flattening visually
        lines = simulated_text.splitlines()
        if len(lines) > 10:
            lines[5] = lines[5] + " " + lines[6]
            del lines[6]
        simulated_text = "\n".join(lines)

    return {
        "atsName": profile.name,
        "simulatedText": simulated_text,
        "compatibilityScore": max(0, compatibility_score),
        "issuesFlagged": issues_flagged
    }
