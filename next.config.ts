import type { NextConfig } from "next";

const isGitHubPagesBuild = process.env.GITHUB_PAGES === "true";
const repoName = "blablaji";

const nextConfig: NextConfig = {
	output: isGitHubPagesBuild ? "export" : undefined,
	trailingSlash: isGitHubPagesBuild,
	images: {
		unoptimized: true,
	},
	basePath: isGitHubPagesBuild ? `/${repoName}` : undefined,
	assetPrefix: isGitHubPagesBuild ? `/${repoName}/` : undefined,
};

export default nextConfig;