
export type DocGuideFaq = {
    faq_answer: string,
    faq_id: number,
    faq_question: string
}

export type DocGuideFaqWithShowAnswer = DocGuideFaq & {
    showAnswer: boolean;
}