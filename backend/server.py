# Initialize sample questions data
async def initialize_sample_questions():
    # Check if questions already exist
    existing_count = await db.iq_questions.count_documents({})
    if existing_count >= 10:  # Changed to ensure we have enough questions
        return
    
    # Clear existing questions to start fresh
    await db.iq_questions.delete_many({})
    
    # Comprehensive matrix reasoning questions bank
    sample_questions = [
        {
            \"question_type\": \"matrix_reasoning\",
            \"difficulty\": \"easy\",
            \"question_text\": \"Which figure logically belongs on the spot of the question mark?\",
            \"pattern_data\": {
                \"grid\": [
                    [{\"pattern\": \"horizontal_lines_3\"}, {\"pattern\": \"vertical_lines_3\"}, {\"pattern\": \"diagonal_lines_3\"}],
                    [{\"pattern\": \"horizontal_lines_2\"}, {\"pattern\": \"vertical_lines_2\"}, {\"pattern\": \"diagonal_lines_2\"}],
                    [{\"pattern\": \"horizontal_lines_1\"}, {\"pattern\": \"vertical_lines_1\"}, {\"pattern\": \"missing\"}]
                ]
            },
            \"options\": [
                {\"pattern\": \"diagonal_lines_1\"},
                {\"pattern\": \"horizontal_lines_1\"}, 
                {\"pattern\": \"vertical_lines_3\"},
                {\"pattern\": \"diagonal_lines_3\"}
            ],
            \"correct_answer\": 0,
            \"explanation\": \"The pattern decreases from 3 lines to 1 line in each column, so the missing piece should have 1 diagonal line.\",
            \"time_limit_seconds\": 60
        },
        {
            \"question_type\": \"matrix_reasoning\",
            \"difficulty\": \"easy\",
            \"question_text\": \"Which figure logically belongs on the spot of the question mark?\",
            \"pattern_data\": {
                \"grid\": [
                    [{\"pattern\": \"square_filled\"}, {\"pattern\": \"circle_filled\"}, {\"pattern\": \"triangle_filled\"}],
                    [{\"pattern\": \"square_empty\"}, {\"pattern\": \"circle_empty\"}, {\"pattern\": \"triangle_empty\"}],
                    [{\"pattern\": \"square_half\"}, {\"pattern\": \"circle_half\"}, {\"pattern\": \"missing\"}]
                ]
            },
            \"options\": [
                {\"pattern\": \"triangle_half\"},
                {\"pattern\": \"square_filled\"},
                {\"pattern\": \"circle_half\"},
                {\"pattern\": \"triangle_filled\"}
            ],
            \"correct_answer\": 0,
            \"explanation\": \"Each row shows the same shapes with different fill patterns: filled, empty, then half-filled.\",
            \"time_limit_seconds\": 75
        },
        {
            \"question_type\": \"matrix_reasoning\",
            \"difficulty\": \"medium\",
            \"question_text\": \"Which figure logically belongs on the spot of the question mark?\",
            \"pattern_data\": {
                \"grid\": [
                    [{\"pattern\": \"horizontal_lines_1\"}, {\"pattern\": \"horizontal_lines_2\"}, {\"pattern\": \"horizontal_lines_3\"}],
                    [{\"pattern\": \"vertical_lines_1\"}, {\"pattern\": \"vertical_lines_2\"}, {\"pattern\": \"vertical_lines_3\"}],
                    [{\"pattern\": \"diagonal_lines_1\"}, {\"pattern\": \"diagonal_lines_2\"}, {\"pattern\": \"missing\"}]
                ]
            },
            \"options\": [
                {\"pattern\": \"diagonal_lines_3\"},
                {\"pattern\": \"horizontal_lines_3\"},
                {\"pattern\": \"vertical_lines_1\"},
                {\"pattern\": \"diagonal_lines_1\"}
            ],
            \"correct_answer\": 0,
            \"explanation\": \"Each row follows the pattern of increasing line count from 1 to 3.\",
            \"time_limit_seconds\": 70
        },
        {
            \"question_type\": \"matrix_reasoning\",
            \"difficulty\": \"medium\",
            \"question_text\": \"Which figure logically belongs on the spot of the question mark?\",
            \"pattern_data\": {
                \"grid\": [
                    [{\"pattern\": \"circle_filled\"}, {\"pattern\": \"square_filled\"}, {\"pattern\": \"triangle_filled\"}],
                    [{\"pattern\": \"circle_half\"}, {\"pattern\": \"square_half\"}, {\"pattern\": \"triangle_half\"}],
                    [{\"pattern\": \"circle_empty\"}, {\"pattern\": \"square_empty\"}, {\"pattern\": \"missing\"}]
                ]
            },
            \"options\": [
                {\"pattern\": \"triangle_empty\"},
                {\"pattern\": \"circle_filled\"},
                {\"pattern\": \"square_empty\"},
                {\"pattern\": \"triangle_filled\"}
            ],
            \"correct_answer\": 0,
            \"explanation\": \"Each column shows the same shape progressing from filled to half-filled to empty.\",
            \"time_limit_seconds\": 80
        },
        {
            \"question_type\": \"matrix_reasoning\",
            \"difficulty\": \"hard\",
            \"question_text\": \"Which figure logically belongs on the spot of the question mark?\",
            \"pattern_data\": {
                \"grid\": [
                    [{\"pattern\": \"horizontal_lines_3\"}, {\"pattern\": \"horizontal_lines_2\"}, {\"pattern\": \"horizontal_lines_1\"}],
                    [{\"pattern\": \"vertical_lines_2\"}, {\"pattern\": \"vertical_lines_1\"}, {\"pattern\": \"vertical_lines_3\"}],
                    [{\"pattern\": \"diagonal_lines_1\"}, {\"pattern\": \"diagonal_lines_3\"}, {\"pattern\": \"missing\"}]
                ]
            },
            \"options\": [
                {\"pattern\": \"diagonal_lines_2\"},
                {\"pattern\": \"horizontal_lines_2\"},
                {\"pattern\": \"vertical_lines_2\"},
                {\"pattern\": \"diagonal_lines_1\"}
            ],
            \"correct_answer\": 0,
            \"explanation\": \"The pattern rotates positions: 3-2-1 becomes 2-1-3 becomes 1-3-2.\",
            \"time_limit_seconds\": 90
        },
        {
            \"question_type\": \"matrix_reasoning\",
            \"difficulty\": \"easy\",
            \"question_text\": \"Which figure logically belongs on the spot of the question mark?\",
            \"pattern_data\": {
                \"grid\": [
                    [{\"pattern\": \"square_filled\"}, {\"pattern\": \"square_empty\"}, {\"pattern\": \"square_half\"}],
                    [{\"pattern\": \"circle_filled\"}, {\"pattern\": \"circle_empty\"}, {\"pattern\": \"circle_half\"}],
                    [{\"pattern\": \"triangle_filled\"}, {\"pattern\": \"triangle_empty\"}, {\"pattern\": \"missing\"}]
                ]
            },
            \"options\": [
                {\"pattern\": \"triangle_half\"},
                {\"pattern\": \"square_half\"},
                {\"pattern\": \"circle_filled\"},
                {\"pattern\": \"triangle_filled\"}
            ],
            \"correct_answer\": 0,
            \"explanation\": \"Each row shows the same shape in different fill states: filled, empty, half-filled.\",
            \"time_limit_seconds\": 65
        },
        {
            \"question_type\": \"matrix_reasoning\",
            \"difficulty\": \"medium\",
            \"question_text\": \"Which figure logically belongs on the spot of the question mark?\",
            \"pattern_data\": {
                \"grid\": [
                    [{\"pattern\": \"vertical_lines_1\"}, {\"pattern\": \"diagonal_lines_1\"}, {\"pattern\": \"horizontal_lines_1\"}],
                    [{\"pattern\": \"vertical_lines_2\"}, {\"pattern\": \"diagonal_lines_2\"}, {\"pattern\": \"horizontal_lines_2\"}],
                    [{\"pattern\": \"vertical_lines_3\"}, {\"pattern\": \"diagonal_lines_3\"}, {\"pattern\": \"missing\"}]
                ]
            },
            \"options\": [
                {\"pattern\": \"horizontal_lines_3\"},
                {\"pattern\": \"vertical_lines_3\"},
                {\"pattern\": \"diagonal_lines_1\"},
                {\"pattern\": \"horizontal_lines_1\"}
            ],
            \"correct_answer\": 0,
            \"explanation\": \"Each row maintains the same line count across different orientations.\",
            \"time_limit_seconds\": 75
        },
        {
            \"question_type\": \"matrix_reasoning\",
            \"difficulty\": \"hard\",
            \"question_text\": \"Which figure logically belongs on the spot of the question mark?\",
            \"pattern_data\": {
                \"grid\": [
                    [{\"pattern\": \"circle_filled\"}, {\"pattern\": \"triangle_empty\"}, {\"pattern\": \"square_half\"}],
                    [{\"pattern\": \"square_filled\"}, {\"pattern\": \"circle_empty\"}, {\"pattern\": \"triangle_half\"}],
                    [{\"pattern\": \"triangle_filled\"}, {\"pattern\": \"square_empty\"}, {\"pattern\": \"missing\"}]
                ]
            },
            \"options\": [
                {\"pattern\": \"circle_half\"},
                {\"pattern\": \"triangle_filled\"},
                {\"pattern\": \"square_filled\"},
                {\"pattern\": \"circle_empty\"}
            ],
            \"correct_answer\": 0,
            \"explanation\": \"Each row and column contains each shape exactly once, and each fill type exactly once.\",
            \"time_limit_seconds\": 90
        },
        {
            \"question_type\": \"matrix_reasoning\",
            \"difficulty\": \"medium\",
            \"question_text\": \"Which figure logically belongs on the spot of the question mark?\",
            \"pattern_data\": {
                \"grid\": [
                    [{\"pattern\": \"horizontal_lines_2\"}, {\"pattern\": \"vertical_lines_1\"}, {\"pattern\": \"diagonal_lines_3\"}],
                    [{\"pattern\": \"diagonal_lines_2\"}, {\"pattern\": \"horizontal_lines_1\"}, {\"pattern\": \"vertical_lines_3\"}],
                    [{\"pattern\": \"vertical_lines_2\"}, {\"pattern\": \"diagonal_lines_1\"}, {\"pattern\": \"missing\"}]
                ]
            },
            \"options\": [
                {\"pattern\": \"horizontal_lines_3\"},
                {\"pattern\": \"vertical_lines_2\"},
                {\"pattern\": \"diagonal_lines_2\"},
                {\"pattern\": \"horizontal_lines_1\"}
            ],
            \"correct_answer\": 0,
            \"explanation\": \"Each row contains one pattern with 1 line, one with 2 lines, and one with 3 lines.\",
            \"time_limit_seconds\": 80
        },
        {
            \"question_type\": \"matrix_reasoning\",
            \"difficulty\": \"hard\",
            \"question_text\": \"Which figure logically belongs on the spot of the question mark?\",
            \"pattern_data\": {
                \"grid\": [
                    [{\"pattern\": \"triangle_filled\"}, {\"pattern\": \"square_half\"}, {\"pattern\": \"circle_empty\"}],
                    [{\"pattern\": \"circle_filled\"}, {\"pattern\": \"triangle_half\"}, {\"pattern\": \"square_empty\"}],
                    [{\"pattern\": \"square_filled\"}, {\"pattern\": \"circle_half\"}, {\"pattern\": \"missing\"}]
                ]
            },
            \"options\": [
                {\"pattern\": \"triangle_empty\"},
                {\"pattern\": \"circle_filled\"},
                {\"pattern\": \"square_half\"},
                {\"pattern\": \"triangle_filled\"}
            ],
            \"correct_answer\": 0,
            \"explanation\": \"Each shape appears once in each row and column, and each fill type appears once in each row and column.\",
            \"time_limit_seconds\": 95
        }
    ]
    
    for question_data in sample_questions:
        question = IQQuestion(**question_data)
        doc = question.model_dump()
        doc['created_at'] = doc['created_at'].isoformat()
        await db.iq_questions.insert_one(doc)