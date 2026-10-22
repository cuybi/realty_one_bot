$ErrorActionPreference = 'Stop'

$skillsDir = "C:\Users\etechadmin\.gemini\config\skills"
$skillsArchiveDir = "C:\Users\etechadmin\.gemini\skills-archive"
$pluginsDir = "C:\Users\etechadmin\.gemini\config\plugins"
$pluginsArchiveDir = "C:\Users\etechadmin\.gemini\plugins-archive"

New-Item -ItemType Directory -Force -Path $skillsArchiveDir | Out-Null
New-Item -ItemType Directory -Force -Path $pluginsArchiveDir | Out-Null

# List of skills to archive (GCP, BigQuery, Spark, Airflow, Data, Bio/Medicine, Ponytail, Niche)
$toArchive = @(
    # GCP & Data/Cloud
    "bigquery-ai-ml",
    "bigquery-bigframes",
    "bigquery-data-transfer-service",
    "bigquery-graph",
    "bigquery-graph-author",
    "bigquery-graph-query",
    "bigquery-sql",
    "bigtable-basics",
    "building-data-apps",
    "data-autocleaning",
    "dataform-bigquery",
    "dbt-bigquery",
    "discovering-gcp-data-assets",
    "enforcing-resource-attribution",
    "federate-lakehouse-catalog",
    "gcp-composer-troubleshooting",
    "gcp-dataflow",
    "gcp-data-pipelines",
    "gcp-managed-airflow-dag-authoring",
    "gcp-managed-airflow-migrations",
    "gcp-managed-airflow-recommendations",
    "gcp-managed-spark-upgrades",
    "gcp-pipeline-orchestration",
    "gcp-pipeline-resource-provisioning",
    "gcp-spark",
    "gcp-spark-troubleshooting",
    "gcs-security-assessment",
    "google-cloud-auth-verification",
    "google-cloud-storage-basics",
    "google-cloud-storage-bucket-architect",
    "google-cloud-storage-fuse",
    "notebook-guidance",
    "schema-mapping",
    "ml-best-practices",

    # Science / Medical / Research
    "literature-review",
    "medical-mcp",
    "paper-lookup",
    "research-lookup",
    "scientific-brainstorming",
    "scientific-critical-thinking",
    "scientific-writing",
    "statistical-analysis",

    # Ponytail suite
    "ponytail",
    "ponytail-audit",
    "ponytail-debt",
    "ponytail-gain",
    "ponytail-help",
    "ponytail-review",

    # Niche OS / Other
    "cachy-doctor",
    "empleo-adaptativo",
    "psychologist-analyst"
)

Write-Host "Moving selected skills to $skillsArchiveDir..."
$movedSkillsCount = 0

foreach ($skill in $toArchive) {
    $src = Join-Path $skillsDir $skill
    $dest = Join-Path $skillsArchiveDir $skill
    if (Test-Path $src) {
        if (Test-Path $dest) {
            Remove-Item -Path $dest -Recurse -Force
        }
        Move-Item -Path $src -Destination $dest -Force
        $movedSkillsCount++
        Write-Host " [Archived] $skill"
    }
}

# Archive science plugin if present
$sciencePluginSrc = Join-Path $pluginsDir "science"
$sciencePluginDest = Join-Path $pluginsArchiveDir "science"
if (Test-Path $sciencePluginSrc) {
    if (Test-Path $sciencePluginDest) {
        Remove-Item -Path $sciencePluginDest -Recurse -Force
    }
    Move-Item -Path $sciencePluginSrc -Destination $sciencePluginDest -Force
    Write-Host " [Archived Plugin] science (42 skills)"
}

Write-Host "`n================ RESUMEN DE LIMPIEZA ================"
$remainingActive = (Get-ChildItem $skillsDir -Directory).Count
$totalArchived = (Get-ChildItem $skillsArchiveDir -Directory).Count
Write-Host "Skills movidas en esta operación: $movedSkillsCount"
Write-Host "Skills activas restantes: $remainingActive"
Write-Host "Total skills en archivo: $totalArchived"
Write-Host "====================================================="
