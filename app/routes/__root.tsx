import appCss from "@/app.css?url";
import { Header } from "@/components/Header";
import { ThemeProvider } from "@/components/theme-provider";
import { Toaster } from "@/components/ui/sonner";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import {
	createRootRouteWithContext,
	HeadContent,
	Outlet,
	Scripts,
	useRouteContext,
} from "@tanstack/react-router";
import type { TRPCOptionsProxy } from "@trpc/tanstack-react-query";
import type * as React from "react";
import { ThirdwebProvider } from "thirdweb/react";
import { DefaultCatchBoundary } from "../components/DefaultCatchBoundary";
import { NotFound } from "../components/NotFound";
import type { TRPCRouter } from "../trpc/router";

// Prevent theme flash script
const themeScript = `
  let theme = localStorage.getItem('vite-ui-theme');
  if (!theme) {
    if (window.matchMedia('(prefers-color-scheme: dark)').matches) {
      theme = 'dark';
    } else {
      theme = 'light';
    }
  }
  document.documentElement.classList.add(theme);
  
  // Fix iOS white background in dark mode when keyboard opens
  if (theme === 'dark') {
    // Force background color on the entire body and html elements
    document.body.style.backgroundColor = 'hsl(var(--background))';
    document.documentElement.style.backgroundColor = 'hsl(var(--background))';
  }
`;

interface AppContext {
	queryClient: QueryClient;
	trpc: TRPCOptionsProxy<TRPCRouter>;
	// Add other context types if any
}

export const Route = createRootRouteWithContext<AppContext>()({
	head: () => ({
		meta: [
			{ charSet: "utf-8" },
			{ name: "viewport", content: "width=device-width, initial-scale=1, maximum-scale=1" },
		],
		links: [{ rel: "stylesheet", href: appCss }],
		scripts: [{ children: themeScript }],
	}),
	errorComponent: (props) => {
		return (
			<RootDocument>
				<DefaultCatchBoundary {...props} />
			</RootDocument>
		);
	},
	notFoundComponent: () => <NotFound />,
	component: RootComponent,
});

function RootComponent() {
	// Access queryClient from the router context
	const { queryClient } = useRouteContext({ from: Route.id }) as AppContext;

	return (
		<QueryClientProvider client={queryClient}>
			<ThirdwebProvider>
				<RootDocument>
					<Outlet />
				</RootDocument>
			</ThirdwebProvider>
		</QueryClientProvider>
	);
}

function RootDocument(props: Readonly<{ children: React.ReactNode }>) {
	return (
		// biome-ignore lint/a11y/useHtmlLang: <explanation>
		<html lang="en">
			<head>
				<HeadContent />
			</head>
			<body className="flex flex-col min-h-screen">
				<ThemeProvider defaultTheme="dark" storageKey="vite-ui-theme">
					<Header />
					<div className="pt-16">
						{props.children}
					</div>
					<Toaster />
				</ThemeProvider>
				<Scripts />
			</body>
		</html>
	);
}
