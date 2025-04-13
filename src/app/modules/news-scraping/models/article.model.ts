export type Article = {
    "_id": string,
    "authors": string[] | null,
    "content": string | null,
    "created_date": string,
    "description": string,
    "published_date": string,
    "publisher": {
        "href": string,
        "title": string
    },
    "title": string,
    "url": string
}