async function doPasswordResetAction(event: Event): Promise<void> {
    event.preventDefault();

    const resetPasswordSuccessElement = document.getElementById("resetPasswordSuccess");
    resetPasswordSuccessElement.classList.add("d-none");
    const resetPasswordErrorElement = document.getElementById("resetPasswordError");
    resetPasswordErrorElement.classList.add("d-none");
    const token = (document.getElementById("token") as HTMLInputElement).value;
    const newPassword = $("#newPassword").val().toString().trim();
    const newPasswordConfirm = $("#newPasswordConfirm").val().toString().trim();

    const resp = await fetch("/api/users/reset_password", {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify({
            "token": token,
            "newPassword": newPassword,
            "newPasswordConfirm": newPasswordConfirm
        })
    });

    if (resp.status !== 200) {
        resetPasswordErrorElement.classList.remove("d-none");
        resetPasswordErrorElement.innerHTML = "";
        JSON.parse(resp.statusText).forEach((error: string) => {
            const listItem = document.createElement("li");
            listItem.innerHTML = error;
            resetPasswordErrorElement.append(listItem);
        });
    } else {
        resetPasswordSuccessElement.classList.remove("d-none");
    }
}

function onResetPasswordPageLoad(): void {
    jQuery(($) => {
        $("#resetPasswordForm").on("submit", doPasswordResetAction);
    });
}

document.addEventListener("DOMContentLoaded", onResetPasswordPageLoad);