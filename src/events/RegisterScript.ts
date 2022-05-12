async function doRegisterAction(event: Event): Promise<void> {
    event.preventDefault();

    const registerErrorElement = document.getElementById("registerError");
    registerErrorElement.classList.add("d-none");
    const registerSuccessElement = document.getElementById("registerSuccess");
    registerSuccessElement.classList.add("d-none");

    const userName = $("#userName").val();
    const password = $("#password").val().toString().trim();
    const passwordConfirm = $("#passwordConfirm").val().toString().trim();
    const email = $("#email").val();
    const fullName = $("#fullName").val();

    const resp = await fetch("/api/users", {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify({
            "userName": userName,
            "password": password,
            "passwordConfirm": passwordConfirm,
            "email": email,
            "fullName": fullName
        })
    });

    if (resp.status !== 200) {
        registerErrorElement.classList.remove("d-none");
        registerErrorElement.innerHTML = "";
        JSON.parse(resp.statusText).forEach((error: string) => {
            const listItem = document.createElement("li");
            listItem.innerHTML = error;
            registerErrorElement.append(listItem);
        });
        return;
    }

    registerErrorElement.classList.add("d-none");
    registerSuccessElement.classList.remove("d-none");

    await new Promise(r => setTimeout(r, 3000)).then(() => {
        document.location.href = "/login";
    });
}

function onRegisterPageLoad(): void {
    jQuery(($) => {
        $("#registerForm").on("submit", doRegisterAction);

    });
}

document.addEventListener("DOMContentLoaded", onRegisterPageLoad);