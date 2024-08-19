import { title } from "@/components/primitives";
import DefaultLayout from "@/layouts/default";
import ReposTable from "@/components/repos-table";
import { Button } from "@nextui-org/react";
import { useState } from "react";

const reports = {
	charts:
		"https://raw.githubusercontent.com/lifeparticle/SelectStar/master/chart_report.csv",
	components:
		"https://raw.githubusercontent.com/lifeparticle/SelectStar/master/comp_report.csv",
	default:
		"https://raw.githubusercontent.com/lifeparticle/SelectStar/master/chart_report.csv",
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
				</div>

				<ReposTable url={url} />
			</section>
		</DefaultLayout>
	);
}
