import { title } from "@/components/primitives";
import DefaultLayout from "@/layouts/default";
import ReposTable from "@/components/repos-table";

type reports = {
	[key: string]: string;
};

export const reports: reports = {
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
	backend_frameworks:
		"https://raw.githubusercontent.com/lifeparticle/SelectStar/master/data/backend_framework_report.json",
	full_stack_frameworks:
		"https://raw.githubusercontent.com/lifeparticle/SelectStar/master/data/full_stack_framework_report.json",
	mobile_desktop:
		"https://raw.githubusercontent.com/lifeparticle/SelectStar/master/data/mobile_desktop_report.json",
	database:
		"https://raw.githubusercontent.com/lifeparticle/SelectStar/master/data/db_report.json",
	monitoring:
		"https://raw.githubusercontent.com/lifeparticle/SelectStar/master/data/monitoring_report.json",
	analytics:
		"https://raw.githubusercontent.com/lifeparticle/SelectStar/master/data/analytics_report.json",
	others:
		"https://raw.githubusercontent.com/lifeparticle/SelectStar/master/data/others_report.json",
	icons:
		"https://raw.githubusercontent.com/lifeparticle/SelectStar/master/data/icons_report.json",
};

export const tabs = [
	{ value: "ui_frameworks", label: "UI frameworks" },
	{ value: "state_management", label: "State management libraries" },
	{ value: "components", label: "Component libraries" },
	{ value: "charts", label: "Charts" },
	{ value: "backend_frameworks", label: "Backend frameworks" },
	{ value: "full_stack_frameworks", label: "Full stack frameworks" },
	{ value: "mobile_desktop", label: "Mobile and desktop frameworks" },
	{ value: "database", label: "Database" },
	{ value: "testing", label: "Testing libraries" },
	{ value: "monitoring", label: "Monitoring tools" },
	{ value: "analytics", label: "Analytics tools" },
	{ value: "icons", label: "Icons" },
	{ value: "others", label: "Others" },
];

export default function IndexPage() {
	return (
		<DefaultLayout>
			<section className="flex flex-col items-center justify-center gap-6 md:py-8">
				<div className="text-center w-full px-4 md:px-10 lg:px-20">
					<h1 className={`${title()} mb-2`} style={{ fontSize: "1.5rem" }}>
						Compare <span className={title({ color: "violet" })}>GitHub</span>{" "}
						repositories based on stars and other relevant parameters.
					</h1>
				</div>

				<ReposTable />
			</section>
		</DefaultLayout>
	);
}
