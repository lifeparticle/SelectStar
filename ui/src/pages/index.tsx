import { title } from "@/components/primitives";
import DefaultLayout from "@/layouts/default";
import ReposTable from "@/components/repos-table";
import { Button, ButtonGroup } from "@nextui-org/react";
import { useState } from "react";

type reports = {
	[key: string]: string;
};

const reports: reports = {
	charts:
		"https://raw.githubusercontent.com/lifeparticle/SelectStar/master/data/chart_report.json",
	components:
		"https://raw.githubusercontent.com/lifeparticle/SelectStar/master/data/comp_report.json",
	testing:
		"https://raw.githubusercontent.com/lifeparticle/SelectStar/master/data/test_report.json",
	state_management:
		"https://raw.githubusercontent.com/lifeparticle/SelectStar/master/data/state_management_report.json",
	ui_frameworks:
		"https://raw.githubusercontent.com/lifeparticle/SelectStar/master/data/ui_framework_report.json",
};

const buttons = [
	{ key: "charts", label: "Charts" },
	{ key: "components", label: "Component libraries" },
	{ key: "testing", label: "Testing libraries" },
	{ key: "state_management", label: "State management libraries" },
	{ key: "ui_frameworks", label: "UI frameworks" },
];

export default function IndexPage() {
	const [selected, setSelected] = useState("charts");

	return (
		<DefaultLayout>
			<section className="flex flex-col items-center justify-center gap-6 md:py-8">
				<div className="text-center w-full px-4 md:px-10 lg:px-20">
					<h1 className={`${title()} mb-2`} style={{ fontSize: "1.5rem" }}>
						Compare <span className={title({ color: "violet" })}>GitHub</span>{" "}
						repositories based on stars and other relevant parameters.
					</h1>
				</div>

				<ButtonGroup variant="bordered" className="flex flex-wrap">
					{buttons.map(({ key, label }) => (
						<Button
							key={key}
							onClick={() => setSelected(key)}
							color={selected === key ? "success" : "default"}
						>
							{label}
						</Button>
					))}
				</ButtonGroup>

				<ReposTable url={reports[selected]} />
			</section>
		</DefaultLayout>
	);
}
