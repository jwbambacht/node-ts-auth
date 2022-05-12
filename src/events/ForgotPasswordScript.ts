async function doForgotPasswordAction(event: Event): Promise<void> {
    event.preventDefault();

    const forgotPasswordSuccessElement = document.getElementById("forgotPasswordSuccess");
    forgotPasswordSuccessElement.classList.add("d-none");
    const forgotPasswordErrorElement = document.getElementById("forgotPasswordError");
    forgotPasswordErrorElement.classList.add("d-none");
    const value = (document.getElementById("value") as HTMLInputElement).value;

    const resp = await fetch("/api/users/forgot_password", {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify({
            "value": value
        })
    });

    if (resp.status === 200) {
        forgotPasswordSuccessElement.classList.remove("d-none");
    } else {
        forgotPasswordErrorElement.classList.remove("d-none");
    }
}

function onForgotPasswordPageLoad(): void {
    jQuery(($) => {
        $("#forgotPasswordForm").on("submit", doForgotPasswordAction);
    });
}

document.addEventListener("DOMContentLoaded", onForgotPasswordPageLoad);