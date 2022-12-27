const dotenv = require("dotenv");
const { Configuration, OpenAIApi } = require("openai");

dotenv.config();

const configuration = new Configuration({
    apiKey: process.env.OPENAI_API_KEY,
});

const openai = new OpenAIApi(configuration);

function csvToJson(csvString) {
    const removedStartingNewLines = csvString.replace(/^\n+/, "");
    console.log("REMOVED STRING: ", removedStartingNewLines);

    //add a new line at the end every line in the string
    const newLineAdded = removedStartingNewLines.replace(/\n/g, "\n");

    // Split the CSV string into an array of lines
    let csvLines = newLineAdded.split("\n");

    // Extract the headers (first line of the CSV)
    let headers = csvLines[0].toLowerCase().split(",");

    // Initialize an empty array to store the JSON objects
    let jsonArray = [];

    // Iterate over the rest of the lines
    for (let i = 1; i < csvLines.length; i++) {
        // Split the current line into an array of values
        let values = csvLines[i].split(",");

        // Initialize an empty object to store the data for this line
        let jsonObject = {};

        // Iterate over the values and add them to the object using the headers as keys
        for (let j = 0; j < values.length; j++) {
            jsonObject[headers[j]] = values[j];
        }

        // Add the object to the array
        jsonArray.push(jsonObject);
    }

    // Return the array of JSON objects
    return jsonArray;
}

const x = async () => {
    const GIFT_ARRAY_LENGTH = 10;

    const relationship = "daughter";
    const age = 5;
    const interests = ["horror stories", "cakes"];
    const info = `My ${relationship} is ${age} years old and she has the following interests: ${interests}`;
    const prompt = `Generate ${GIFT_ARRAY_LENGTH} possible gifts in Italian. These are the main info: 
${info}

Give me the output as a valid CSV with header like: name, averagePrice.
    `;
    console.log(prompt);

    try {
        const response = await openai.createCompletion({
            model: "text-davinci-003",
            prompt,
            temperature: 1,
            max_tokens: 300,
        });

        // console.log(JSON.stringify(response.data, null, 2))
        // if(response.data.finish_reason !== "stop") throw new Error('Too many tokens, cannot generate a valid JSON document')
        console.log(response.data);
        const items = csvToJson(response.data.choices[0].text);
        console.log(items);

        const itemsWithAmazonSearch = items.map((item) => {
            return {
                ...item,
                amazonSearch: `https://www.amazon.it/s?k=${item.name.replace(
                    / /g,
                    "+"
                )}`,
            };
        });

        console.log(itemsWithAmazonSearch);
    } catch (error) {
        //console.error(error)
        console.log(error);
        //console.log("Urca urca Topolino, qualcosa non va...");
    }
};

x();
