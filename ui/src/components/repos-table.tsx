import React from "react";
import {
	Table,
	TableHeader,
	TableColumn,
	TableBody,
	TableRow,
	TableCell,
	getKeyValue,
} from "@nextui-org/table";
import { useAsyncList } from "@react-stately/data";
import { Spinner } from "@nextui-org/spinner";
import Papa from "papaparse";

interface RepoData {
	html_url: string;
	created_at: string;
	pushed_at: string;
	stargazers_count: string;
	updated_at: string;
}

export default function ReposTable() {
	const [isLoading, setIsLoading] = React.useState(true);

	let list = useAsyncList<RepoData>({
		async load({ signal }) {
			let res = await fetch(
				"https://raw.githubusercontent.com/lifeparticle/SelectStar/master/repo_report.csv",
				{
					signal,
				}
			);
			const csvText = await res.text();
			const parsedData = Papa.parse<RepoData>(csvText, { header: true });

			const items = parsedData.data.map((item) => ({
				html_url: item.html_url,
				created_at: item.created_at,
				pushed_at: item.pushed_at,
				stargazers_count: item.stargazers_count,
				updated_at: item.updated_at,
			}));

			setIsLoading(false);

			return {
				items: items,
			};
		},
		async sort({ items, sortDescriptor }) {
			return {
				items: items.sort((a, b) => {
					let first = a[sortDescriptor.column as keyof RepoData];
					let second = b[sortDescriptor.column as keyof RepoData];
					let cmp =
						(parseInt(first as string) || first) <
						(parseInt(second as string) || second)
							? -1
							: 1;

					if (sortDescriptor.direction === "descending") {
						cmp *= -1;
					}

					return cmp;
				}),
			};
		},
	});

	return (
		<Table
			aria-label="Example table with client side sorting"
			sortDescriptor={list.sortDescriptor}
			onSortChange={list.sort}
			classNames={{
				table: "min-h-[400px]",
			}}
		>
			<TableHeader>
				<TableColumn key="html_url" allowsSorting>
					URL
				</TableColumn>
				<TableColumn key="stargazers_count" allowsSorting>
					Stargazers count
				</TableColumn>
				<TableColumn key="created_at" allowsSorting>
					Created At
				</TableColumn>
				<TableColumn key="pushed_at" allowsSorting>
					Pushed At
				</TableColumn>
				<TableColumn key="updated_at" allowsSorting>
					Updated At
				</TableColumn>
			</TableHeader>
			<TableBody
				items={list.items}
				isLoading={isLoading}
				loadingContent={<Spinner label="Loading..." />}
			>
				{(item) => (
					<TableRow key={item.html_url}>
						{(columnKey) => (
							<TableCell>
								{getKeyValue(item, columnKey as keyof RepoData)}
							</TableCell>
						)}
					</TableRow>
				)}
			</TableBody>
		</Table>
	);
}
