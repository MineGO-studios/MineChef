const { Configuration, OpenAIApi } = require("openai");

exports.handler = async (event) => {
    try {
        const apiKey = process.env.OPENAI_API_KEY; // Get API key from Netlify environment variables

        if (!apiKey) {
            return {
                statusCode: 500,
                body: JSON.stringify({ error: "OPENAI_API_KEY not set in environment variables" }),
            };
        }

        const configuration = new Configuration({
            apiKey: apiKey,
        });
        const openai = new OpenAIApi(configuration);

        const { mealType, ingredients, taste1, taste2, preparationPace, additionalNotes } = JSON.parse(event.body);

        // Construct the prompt for ChatGPT
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

        const completion = await openai.createChatCompletion({
            model: "gpt-3.5-turbo", // You can choose other models
            messages: [{ role: "user", content: prompt }],
        });

        const recipe = completion.data.choices[0].message.content;

        // Basic structured recipe output
        const structuredRecipe = {
            ingredientsUsed: ingredients,
            preparationInstructions: recipe.split('\n').filter(line => line.trim() !== ''), // Basic line splitting
            approximateNutritionalValues: "Nutritional information not available in this response.", // ChatGPT often doesn't provide this reliably
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