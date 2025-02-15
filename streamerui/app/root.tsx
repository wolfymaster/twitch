import { Meta, Links, Scripts, Outlet, ScrollRestoration, useLocation, json, useLoaderData } from "@remix-run/react";
import SuperTokens, { SuperTokensWrapper } from "supertokens-auth-react";
import { frontendConfig } from "./config/frontend";
import { SessionAuth } from "supertokens-auth-react/recipe/session/index.js";
import type { LinksFunction } from "@remix-run/node";
import appStylesHref from "./app.css?url";
export const links: LinksFunction = () => [{ rel: "stylesheet", href: appStylesHref }];

if (typeof window !== "undefined") {
    SuperTokens.init(frontendConfig());
}

export default function App() {
    const location = useLocation();
    const isUnprotectedRoute = location.pathname.startsWith("/auth");

    return (
        <html lang="en">
            <head>
                <Meta />
                <Links />
            </head>
            <body className="app-wrapper">
                <SuperTokensWrapper>
                    {isUnprotectedRoute ? (
                        <Outlet />
                    ) : (
                        <SessionAuth>
                            <Outlet />
                        </SessionAuth>
                    )}
                    <ScrollRestoration />
                    <Scripts />
                </SuperTokensWrapper>
            </body>
        </html>
    );
}
