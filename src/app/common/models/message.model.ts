export type MessageModel = {
    index: number,
    message: string,
    isOwnerMe: boolean,
    role?: string,
    metaData?: string,
    assessment_score?: number,
    extra_query?: string,
    call_to_actions?: CallToAction[]
}
export type CallToAction = {
    label: string,
    action: string,
    type: string,
    metadata?: {
        stage_id: string,
        tooltip?: string
    }
}


export type ServerHistoryModel = {
    chat_created_datetime: string,
    chat_id: string,
    content: string,
    role: string,
    stage_id: string
}