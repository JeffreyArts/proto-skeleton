module.exports = {
    resContentUndefined: {
        userMessage: "Server error",
        devMessage: "Incorrect req.resContent value"
    },
    invalidInput: {
        userMessage: "Invalid input",
        devMessage: `The input contains an invalid property`
    },
    incorrectPassword: {
        userMessage: "Incorrect password",
        devMessage: "Password is invalid"
    },
    accountAlreadyExists: {
        userMessage: "An account with this e-mail already exists",
        devMessage: "Failed to create account, because e-mailaddress already exists in database"
    },
    invalidTokenFormat: {
        userMessage: "Can not finish request cause of a technical error",
        devMessage: "Invalid token format, use 'JWT {TOKEN}'."
    },
    endPointUnavailable: {
        userMessage: "Endpoint does not exists",
        devMessage: "No routing has been set for endpoint"
    }
}
