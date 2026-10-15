// 1. We create a fake network request that takes 2 seconds to finish.
// We use 'const' because this function should never change.
const simulateDatabaseConnection = () => {
    return new Promise((resolve, reject) => {
        setTimeout(() => {
            // Change this to false to see the catch block run!
            const isPasswordCorrect = false; 

            if (isPasswordCorrect) {
                resolve("Fake Database Connected Successfully!");
            } else {
                reject(new Error("Wrong database password."));
            }
        }, 2000); 
    });
};

// 2. We use 'async' to declare a function that will handle the time delay.
const runTest = async () => {
    console.log("Starting server...");
    
    // 3. We use try/catch to handle potential errors
    try {
        console.log("Attempting to connect to the database...");
        
        // 4. We use 'await' to pause here until the 2-second timer finishes
        const result = await simulateDatabaseConnection();
        
        console.log(result);
        console.log("Server is ready for users!");
        
    } catch (error) {
        // If the password was false, it jumps straight here.
        console.error("CRITICAL FAILURE:", error.message);
        process.exit(1);
    }
};

// 5. Execute the function
runTest();