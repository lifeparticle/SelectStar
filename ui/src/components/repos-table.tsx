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

export default function ReposTable() {
	const [isLoading, setIsLoading] = React.useState(true);

	let list = useAsyncList({
		async load({ signal }) {
			let res = await fetch(
				"https://raw.githubusercontent.com/lifeparticle/SelectStar/master/repo_report.csv",
				{
					signal,
				}
			);
			const csvText = await res.text();
			const parsedData = Papa.parse(csvText, { header: true });

			const items = parsedData.data.map((item: any) => ({
				html_url: item.html_url,
				created_at: item.created_at,
				pushed_at: item.pushed_at,
				stargazers_count: item.stargazers_count,
				updated_at: item.updated_at,
			}));

			setIsLoading(false);

			console.log(parsedData.data);

			return {
				items: items,
			};
		},
		async sort({ items, sortDescriptor }) {
			return {
				items: items.sort((a: any, b: any) => {
					let first = a[sortDescriptor.column];
					let second = b[sortDescriptor.column];
					let cmp =
						(parseInt(first) || first) < (parseInt(second) || second) ? -1 : 1;

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
				{(item: any) => (
					<TableRow key={item.html_url}>
						{(columnKey) => (
							<TableCell>{getKeyValue(item, columnKey)}</TableCell>
						)}
					</TableRow>
				)}
			</TableBody>
		</Table>
	);
}
