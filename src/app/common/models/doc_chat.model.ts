
export type DocChatSchema = {
    schema_id?: number,
    field: string,
    description: string,
    order_number: number
}
export type DocChatSchemaWithCollectionId = {
    collection_id: number;
    schema: DocChatSchema[]
}


export type DocChatSchemaWithID = DocChatSchema & {
    schema_id: number,
}

export type DocChatSchemaWithIDwithIsSelected = DocChatSchemaWithID & {
    isSelected: boolean,
}

export type DocChatMetadataFile = {
    file_id: number,
    file_name: string,
    processed_percentage: number
}
export type DocChatMetadataFileWithIsSelected = DocChatMetadataFile & {
    isSelected: boolean,
}