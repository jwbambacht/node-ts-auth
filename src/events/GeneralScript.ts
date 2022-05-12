const originalFetch = window.fetch;

window.fetch = async (input: RequestInfo, init?: RequestInit): Promise<Response> => {
    const resp = await originalFetch(input, init);

    if (resp.status === 401 && document.location.pathname !== "/login") {
        sessionStorage.clear();
        alert("Your session has expired! Click OK to be redirected to the login page.");
        document.location.href="/login";
    }
    return resp;
};

function logOut(): void {
    sessionStorage.clear();
    document.cookie = 'bearer=; expires=Thu, 01 Jan 1970 00:00:01 GMT;';
    document.location.href="/";
}

function onGenericPageLoad(): void {
    jQuery(($) => {

        $('[data-bs-toggle="tooltip"]').tooltip({
            html: true
        });

        $("#logOutButton").on("click", logOut);

        if (sessionStorage.getItem("secret")) {
            $(".not-logged-in").each((index, element) => {
                $(element).addClass("d-none");
            });

            $(".logged-in").each((index, element) => {
                $(element).removeClass("d-none");
            });
        } else {
            $(".not-logged-in").each((index, element) => {
                $(element).removeClass("d-none");
            });

            $(".logged-in").each((index, element) => {
                $(element).addClass("d-none");
            });
        }
    });
}

document.addEventListener("DOMContentLoaded", onGenericPageLoad);