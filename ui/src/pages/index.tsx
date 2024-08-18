import { title } from "@/components/primitives";
import DefaultLayout from "@/layouts/default";
import ReposTable from "@/components/repos-table";

export default function IndexPage() {
	return (
		<DefaultLayout>
			<section className="flex flex-col items-center justify-center gap-4 py-8 md:py-10">
				<div className="inline-block max-w-lg text-center justify-center">
					<h1 className={title()}>Compare&nbsp;</h1>
					<h1 className={title({ color: "violet" })}>GitHub&nbsp;</h1>
					<br />
					<h1 className={title()}>
						Repositories Based on the Number of Stars and Other Relevant
						Parameters
					</h1>
				</div>

				<ReposTable />
			</section>
		</DefaultLayout>
	);
}
