/**
 * Inline translations fallback
 * Used when external translation files can't be loaded
 */

export const inlineTranslations = {
    en: {
        common: {
            ok: "OK",
            cancel: "Cancel",
            save: "Save",
            back: "Back",
            loading: "Loading...",
            error: "Error"
        },
        login: {
            title: "Login to BlueSky",
            handle: "Handle or Email",
            handlePlaceholder: "user.bsky.social",
            password: "Password",
            passwordPlaceholder: "App Password",
            submit: "Sign In",
            loggingIn: "Signing in...",
            error: "Login failed. Check your credentials.",
            signupLink: "Don't have an account? Sign up"
        },
        signup: {
            title: "Create Account",
            email: "Email",
            handle: "Handle",
            password: "Password",
            submit: "Create Account",
            loginLink: "Already have an account? Sign in",
            errors: {
                emailRequired: "Email is required",
                handleRequired: "Handle is required",
                handleInvalid: "Invalid handle format",
                passwordRequired: "Password is required"
            }
        },
        timeline: {
            title: "Timeline",
            empty: "No posts yet",
            refresh: "Refresh"
        },
        post: {
            like: "Like",
            repost: "Repost",
            reply: "Reply",
            delete: "Delete"
        },
        compose: {
            title: "New Post",
            placeholder: "What's happening?",
            post: "Post",
            cancel: "Cancel"
        },
        profile: {
            title: "Profile",
            posts: "Posts",
            followers: "Followers",
            following: "Following",
            editProfile: "Edit Profile"
        },
        navigation: {
            timeline: "Timeline",
            notifications: "Notifications",
            profile: "Profile",
            settings: "Settings"
        },
        errors: {
            network: "Network error. Check your connection.",
            auth: "Authentication failed. Please login again.",
            unknown: "An error occurred"
        }
    }
};
