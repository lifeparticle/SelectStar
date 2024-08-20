import {
	Table,
	TableHeader,
	TableColumn,
	TableBody,
	TableRow,
	TableCell,
	Input,
	User,
	Spinner,
	Autocomplete,
	AutocompleteItem,
} from "@nextui-org/react";
import { Key, useCallback, useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { reports, tabs } from "@/pages";

export function formatDate(dateString: string | undefined): string {
	if (!dateString) {
		return "";
	}

	const dateObject = new Date(dateString);

	const formatDate = new Intl.DateTimeFormat("en-GB", {
		dateStyle: "long",
		timeZone: "Australia/Sydney",
	}).format(dateObject);

	return formatDate;
}

function formatDaysAgo(dateString: string): string {
	const lastUpdated = new Date(dateString);
	const today = new Date();

	lastUpdated.setHours(0, 0, 0, 0);
	today.setHours(0, 0, 0, 0);

	const timeDifference = Math.abs(today.getTime() - lastUpdated.getTime());
	const daysDifference = Math.ceil(timeDifference / (1000 * 60 * 60 * 24));

	if (daysDifference === 0) {
		return "Today";
	}

	return `${daysDifference} day${daysDifference !== 1 ? "s" : ""} ago`;
}

type CustomSortDescriptor = {
	column: string | undefined;
	direction: "ascending" | "descending";
};

interface RepoData {
	name: string;
	description: string;
	owner_avatar_url: string;
	html_url: string;
	created_at: string;
	pushed_at: string;
	stargazers_count: number;
	updated_at: string;
}

interface RepoMeta {
	last_updated: string;
}

interface RepoResponse {
	data: RepoData[];
	meta: RepoMeta;
}

const columns = [
	{ name: "Name", uid: "name", sortable: true },
	{ name: "Description", uid: "description", sortable: false },
	{ name: "Stargazers count", uid: "stargazers_count", sortable: true },
	{ name: "Created at", uid: "created_at", sortable: true },
	{ name: "Pushed at", uid: "pushed_at", sortable: true },
	{ name: "Updated at", uid: "updated_at", sortable: true },
];

export default function ReposTable() {
	const [filterValue, setFilterValue] = useState("");
	const [sortDescriptor, setSortDescriptor] = useState<CustomSortDescriptor>({
		column: "stargazers_count",
		direction: "descending",
	});
	const [selected, setSelected] = useState("ui_frameworks");

	console.log("selected", selected);

	const { data, isLoading } = useQuery<RepoResponse>({
		queryKey: ["repos", selected],
		queryFn: async () => {
			const res = await fetch(reports[selected]);
			return res.json();
		},
		staleTime: 10 * 60 * 1000,
	});

	const filteredItems = useMemo(() => {
		return (
			data?.data.filter((repo) =>
				repo.name.toLowerCase().includes(filterValue.toLowerCase())
			) || []
		);
	}, [data, filterValue]);

	const sortedItems = useMemo(() => {
		return [...filteredItems].sort((a, b) => {
			const first = a[sortDescriptor.column as keyof RepoData];
			const second = b[sortDescriptor.column as keyof RepoData];
			const cmp =
				(parseInt(first as string) || first) <
				(parseInt(second as string) || second)
					? -1
					: 1;

			return sortDescriptor.direction === "descending" ? -cmp : cmp;
		});
	}, [filteredItems, sortDescriptor]);

	const renderCell = useCallback((repo: RepoData, columnKey: Key) => {
		const cellValue = repo[columnKey as keyof RepoData];

		switch (columnKey) {
			case "name":
				return (
					<User
						avatarProps={{ radius: "lg", src: repo.owner_avatar_url }}
						name={cellValue}
					>
						{repo.description}
					</User>
				);
			case "created_at":
			case "pushed_at":
			case "updated_at":
				return formatDate(cellValue as string);
			default:
				return cellValue;
		}
	}, []);

	const onSearchChange = useCallback((value: string) => {
		setFilterValue(value);
	}, []);

	const topContent = useMemo(() => {
		return (
			<div className="flex flex-col gap-4">
				<div className="flex flex-col sm:flex-row justify-between gap-3 items-end">
					<Autocomplete
						placeholder="Search a category..."
						className="w-full sm:max-w-[30%]"
						defaultItems={tabs}
						defaultSelectedKey={selected}
						onSelectionChange={(key) => setSelected(key as string)}
					>
						{(item) => (
							<AutocompleteItem key={item.value}>{item.label}</AutocompleteItem>
						)}
					</Autocomplete>
					<Input
						className="w-full sm:max-w-[30%]"
						isClearable
						placeholder="Search by name..."
						size="md"
						value={filterValue}
						onValueChange={onSearchChange}
					/>
				</div>
			</div>
		);
	}, [filterValue, onSearchChange]);

	const bottomContent = useMemo(() => {
		const lastUpdatedDate = data?.meta?.last_updated;
		return (
			<div className="py-2 px-2 flex justify-center">
				<p className="text-sm text-gray-600">
					{!isLoading &&
						lastUpdatedDate &&
						`Last updated: ${formatDate(lastUpdatedDate)} (${formatDaysAgo(
							lastUpdatedDate
						)})`}
				</p>
			</div>
		);
	}, [sortedItems.length, data?.meta?.last_updated, isLoading]);

	return (
		<Table
			aria-label="Repositories Table"
			isHeaderSticky
			bottomContent={bottomContent}
			bottomContentPlacement="outside"
			classNames={{
				wrapper: "max-h-[65dvh]",
			}}
			selectionMode="single"
			sortDescriptor={sortDescriptor}
			topContent={topContent}
			topContentPlacement="outside"
			onSortChange={(descriptor) =>
				setSortDescriptor({
					column: descriptor.column?.toString(),
					direction: descriptor.direction as "ascending" | "descending",
				})
			}
			onRowAction={(key) => window.open(key as string, "_blank")}
		>
			<TableHeader columns={columns}>
				{(column) => (
					<TableColumn key={column.uid} allowsSorting={column.sortable}>
						{column.name}
					</TableColumn>
				)}
			</TableHeader>
			<TableBody
				emptyContent={"No repositories found"}
				isLoading={isLoading}
				loadingContent={<Spinner label="Loading..." />}
				items={sortedItems}
			>
				{(item) => (
					<TableRow key={item.html_url}>
						{(columnKey) => (
							<TableCell>{renderCell(item, columnKey)}</TableCell>
						)}
					</TableRow>
				)}
			</TableBody>
		</Table>
	);
}
