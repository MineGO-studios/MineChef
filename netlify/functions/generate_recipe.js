const { OpenAI } = require("openai");

exports.handler = async (event) => {
    try {
        const apiKey = process.env.OPENAI_API_KEY;

        if (!apiKey) {
            return {
                statusCode: 500,
                body: JSON.stringify({ error: "OPENAI_API_KEY not set in environment variables" }),
            };
        }

        const openai = new OpenAI({ apiKey }); // Instantiate OpenAI with the apiKey

        const { mealType, ingredients, taste1, taste2, preparationPace, additionalNotes } = JSON.parse(event.body);

        let prompt = `Generate a recipe for a ${mealType} using the following ingredients: ${ingredients.join(', ')}. `;

        if (taste1) {
            prompt += `The taste profile should lean towards ${taste1}`;
            if (taste2) {
                prompt += ` and ${taste2}.`;
            } else {
                prompt += ".";
            }
        }

        prompt += ` The preparation pace should be ${preparationPace}. `;

        if (additionalNotes) {
            prompt += `Additional notes: ${additionalNotes}.`;
        }

        const completion = await openai.chat.completions.create({
            model: "gpt-3.5-turbo",
            messages: [{ role: "user", content: prompt }],
        });

        const recipe = completion.choices[0].message.content;

        const structuredRecipe = {
            ingredientsUsed: ingredients,
            preparationInstructions: recipe.split('\n').filter(line => line.trim() !== ''),
            approximateNutritionalValues: "Nutritional information not available in this response.",
        };

        return {
            statusCode: 200,
            body: JSON.stringify(structuredRecipe),
        };
    } catch (error) {
        console.error("Error calling ChatGPT API:", error);
        return {
            statusCode: 500,
            body: JSON.stringify({ error: "Failed to generate recipe" }),
        };
    }
};