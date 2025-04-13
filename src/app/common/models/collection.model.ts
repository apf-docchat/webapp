export type CollectionFile = {
    "file_id": number,
    "file_name": string,
    "file_url": string,
    "file_upload_datetime"?: string
}
export type CollectionTable = {
  "table_name": string,
}
export type CollectionFileWithSelection = CollectionFile & {
    isSelected: boolean;
}
export type Collection = {
    "collection_id": number,
    "collection_name": string,
    "collection_description": string,
    "description": string,
    "is_private": boolean,
    "module_id": string,
    "module_name": string,
    "module_type": string,
    "files": CollectionFile[],
    "tables": CollectionTable[],
}

export type CurrentScreen = 'createCollection' | 'UpdateCollectionName' | 'collectionView' | 'uploadFile' | 'deleteFiles' | 'moveFiles';

export type Organization = {
    "organization_id": number,
    "organization_name": string,
    "role": string
  }
export type module = {
    "module_description": string,
    "module_id": number,
    "module_name": string,
    "module_type": string
  }

  export type Insight = {
    "id": number,
    "order_number": number,
    "title": string,
    "html_data": string,
    "image_data": string,
    "query": string,
    dataLoading: boolean,
    "updated_at": string
  }

  export type InsightMap = {
    [id: number]: Insight;
  };

  export type Job = {
    id: number;
    job_collection_id: number;
    query: string;
    order_number: number;
    title: string;
    html_steps_data: { [id: string]: string };
    image_steps_data: { [id: string]: string };
    steps: string;
    api_endpoint: string;
    dataLoading: boolean;
  };
  export type JobMap = {
    [id: number]: Job;
  };