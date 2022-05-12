async function doLoginAction(event: Event): Promise<void> {
    event.preventDefault();

    const loginErrorElement = document.getElementById("loginError");
    const userName = (document.getElementById("userName") as HTMLInputElement).value;
    const password = (document.getElementById("password") as HTMLInputElement).value.toString().trim();

    let resp = await fetch("/api/auth/login", {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify({
            "userName": userName,
            "password": password
        })
    });

    if (resp.status !== 200) {
        if (resp.status === 400) {
            loginErrorElement.innerHTML = resp.statusText;
            loginErrorElement.classList.remove("d-none");
        }

        return;
    }

    const data = await resp.json();
    const bearerStr = window.btoa(userName + ":" + data.signature);
    document.cookie = `bearer=${bearerStr};path=/;expires=${Math.round(data.expiresIn/1000)};samesite=strict`;

    resp = await fetch("/api/auth/validate");
    if (resp.status !== 200) {
        if (resp.status == 401) {
            loginErrorElement.innerHTML = resp.statusText;
            loginErrorElement.classList.remove("d-none");
        }
        return;
    }

    sessionStorage.setItem("secret", data.signature);
    document.location.href="/";
}

function onLoginPageLoad(): void {
    sessionStorage.clear();

    jQuery(($) => {
        $("#loginForm").on("submit", doLoginAction);
    });
}

document.addEventListener("DOMContentLoaded", onLoginPageLoad);