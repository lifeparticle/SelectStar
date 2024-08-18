import { title } from "@/components/primitives";
import DefaultLayout from "@/layouts/default";
import ReposTable from "@/components/repos-table";
import { Button } from "@nextui-org/react";

export default function IndexPage() {
	return (
		<DefaultLayout>
			<section className="flex flex-col items-center justify-center gap-6 py-12 md:py-16">
				<div className="flex flex-col items-center justify-center text-center w-full px-4 md:px-10 lg:px-20">
					<h1 className={`${title()} mb-2`} style={{ fontSize: "1.5rem" }}>
						Compare <span className={title({ color: "violet" })}>GitHub</span>{" "}
						Repositories
					</h1>
					<h1 className={title()} style={{ fontSize: "1.5rem" }}>
						Based on the Number of Stars and Other Relevant Parameters
					</h1>
				</div>

				<div className="flex gap-6">
					<Button>Charts</Button>
					<Button disabled>Component libraries</Button>
				</div>

				<ReposTable />
			</section>
		</DefaultLayout>
	);
}
