
export type DocGuideFile = {
    "file_id": number,
    "file_name": string,
    "file_url": string,
    "org_id": number,
    "upload_date": string,
    "collection_id": string
}
export type DocGuideFileWithSelection = DocGuideFile & {
    isSelected: boolean;
}

export type DocGuideSection = {
    file_id: number
    section_id: number
    section_title: string
    is_enabled: boolean
    section_assessment_score: number | null
    section_status: string | null
    latest_thread_id: string | null
}

export type DocGuideSectionStage = 'INITIAL_CHAT' | 'CONVERSATION' | 'TIMED_OUT' | 'COMPLETED';