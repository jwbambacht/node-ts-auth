async function doUpdateProfileAction(event: Event): Promise<void> {
    event.preventDefault();
    const updateProfileSuccessElement = document.getElementById("updateProfileSuccess");
    updateProfileSuccessElement.classList.add("d-none");
    const updateProfileErrorElement = document.getElementById("updateProfileError");
    updateProfileErrorElement.classList.add("d-none");

    const userName = $("#userName").val();
    const email = $("#email").val();
    const fullName = $("#fullName").val();

    const resp = await fetch("/api/users/update/profile", {
        method: "PUT",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify({
            "userName": userName,
            "email": email,
            "fullName": fullName
        })
    });

    if (resp.status !== 200) {
        updateProfileErrorElement.classList.remove("d-none");
        updateProfileErrorElement.innerHTML = "";
        JSON.parse(resp.statusText).forEach((error: string) => {
            const listItem = document.createElement("li");
            listItem.innerHTML = error;
            updateProfileErrorElement.append(listItem);
        });
    } else {
        updateProfileSuccessElement.classList.remove("d-none");
    }

    await new Promise(r => setTimeout(r, 3000)).then(() => {
        updateProfileSuccessElement.classList.add("d-none");
        updateProfileErrorElement.classList.add("d-none");
    });
}

async function doUpdatePasswordAction(event: Event): Promise<void> {
    event.preventDefault();

    const updatePasswordSuccessElement = document.getElementById("updatePasswordSuccess");
    updatePasswordSuccessElement.classList.add("d-none");
    const updatePasswordErrorElement = document.getElementById("updatePasswordError");
    updatePasswordErrorElement.classList.add("d-none");

    const currentPassword = $("#currentPassword").val();
    const newPassword = $("#newPassword").val().toString().trim();
    const newPasswordConfirm = $("#newPasswordConfirm").val().toString().trim();

    const resp = await fetch("/api/users/update/password", {
        method: "PUT",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify({
            "currentPassword": currentPassword,
            "newPassword": newPassword,
            "newPasswordConfirm": newPasswordConfirm
        })
    });

    if (resp.status !== 200) {
        updatePasswordErrorElement.classList.remove("d-none");
        updatePasswordErrorElement.innerHTML = "";
        JSON.parse(resp.statusText).forEach((error: string) => {
            const listItem = document.createElement("li");
            listItem.innerHTML = error;
            updatePasswordErrorElement.append(listItem);
        });
    } else {
        updatePasswordSuccessElement.classList.remove("d-none");
    }
}

async function doDeleteAccountAction(event: Event): Promise<void> {
    event.preventDefault();

    if (confirm("Are you sure to delete your account? This action cannot be undone.")) {
        const resp = await fetch("/api/users", {
            method: "DELETE",
        });

        if (resp.status === 200) {
            logOut();
        }
    }
}

function onAccountPageLoad(): void {
    jQuery(($) => {
        $("#updateProfileForm").on("submit", doUpdateProfileAction);
        $("#updatePasswordForm").on("submit", doUpdatePasswordAction);
        $("#deleteAccount").on("click", doDeleteAccountAction);
    });
}

document.addEventListener("DOMContentLoaded", onAccountPageLoad);