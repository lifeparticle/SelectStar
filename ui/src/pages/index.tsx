import { title } from "@/components/primitives";
import DefaultLayout from "@/layouts/default";
import ReposTable from "@/components/repos-table";
import { Button } from "@nextui-org/react";
import { useState } from "react";

const reports = {
	charts:
		"https://raw.githubusercontent.com/lifeparticle/SelectStar/master/data/chart_report.json",
	components:
		"https://raw.githubusercontent.com/lifeparticle/SelectStar/master/data/comp_report.json",
	testing:
		"https://raw.githubusercontent.com/lifeparticle/SelectStar/master/data/test_report.json",
	state_management:
		"https://raw.githubusercontent.com/lifeparticle/SelectStar/master/data/state_management_report.json",
	ui_frameworks:
		"https://raw.githubusercontent.com/lifeparticle/SelectStar/master/data/ui_frameworks_report.json",
	default:
		"https://raw.githubusercontent.com/lifeparticle/SelectStar/master/data/chart_report.json",
};

export default function IndexPage() {
	const [url, setUrl] = useState(reports.default);

	return (
		<DefaultLayout>
			<section className="flex flex-col items-center justify-center gap-6 md:py-8">
				<div className="flex flex-col items-center justify-center text-center w-full px-4 md:px-10 lg:px-20">
					<h1 className={`${title()} mb-2`} style={{ fontSize: "1.5rem" }}>
						Compare <span className={title({ color: "violet" })}>GitHub</span>{" "}
						repositories based on the number of stars and other relevant
						parameters.
					</h1>
				</div>

				<div className="flex gap-6">
					<Button onClick={() => setUrl(reports.charts)}>Charts</Button>
					<Button onClick={() => setUrl(reports.components)}>
						Component libraries
					</Button>
					<Button onClick={() => setUrl(reports.testing)}>
						Testing libraries
					</Button>
					<Button onClick={() => setUrl(reports.state_management)}>
						State management libraries
					</Button>
					<Button onClick={() => setUrl(reports.ui_frameworks)}>
						UI frameworks
					</Button>
				</div>

				<ReposTable url={url} />
			</section>
		</DefaultLayout>
	);
}
