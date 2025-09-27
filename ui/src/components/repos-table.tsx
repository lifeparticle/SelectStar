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
import { useCallback, useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { reports, proReports, tabs } from "@/pages";
import { Key as ReactKey } from "@react-types/shared";

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
	column: ReactKey;
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

interface ProData {
	name: string;
	description: string;
	url: string;
}

interface ProMeta {
	last_updated: string;
}

interface ProResponse {
	data: ProData[];
	meta: ProMeta;
}

const columns = [
	{ name: "Name", uid: "name", sortable: true },
	{ name: "Description", uid: "description", sortable: false },
	{ name: "Stargazers count", uid: "stargazers_count", sortable: true },
	{ name: "Created at", uid: "created_at", sortable: true },
	{ name: "Pushed at", uid: "pushed_at", sortable: true },
	{ name: "Updated at", uid: "updated_at", sortable: true },
];

const proColumns = [
	{ name: "Name", uid: "name", sortable: true },
	{ name: "Description", uid: "description", sortable: false },
	{ name: "URL", uid: "url", sortable: false },
];

export default function ReposTable() {
	const [openSourceFilterValue, setOpenSourceFilterValue] = useState("");
	const [proFilterValue, setProFilterValue] = useState("");
	const [openSourceSortDescriptor, setOpenSourceSortDescriptor] =
		useState<CustomSortDescriptor>({
			column: "stargazers_count",
			direction: "descending",
		});
	const [proSortDescriptor, setProSortDescriptor] =
		useState<CustomSortDescriptor>({
			column: "name",
			direction: "ascending",
		});
	const [openSourceSelected, setOpenSourceSelected] = useState("ui_frameworks");
	const [proSelected, setProSelected] = useState("ui_frameworks");

	console.log("openSourceSelected", openSourceSelected);
	console.log("proSelected", proSelected);

	const { data, isLoading } = useQuery<RepoResponse>({
		queryKey: ["repos", openSourceSelected],
		queryFn: async () => {
			const res = await fetch(reports[openSourceSelected]);
			return res.json();
		},
		staleTime: 10 * 60 * 1000,
	});

	const { data: proData, isLoading: isProLoading } = useQuery<ProResponse>({
		queryKey: ["pro-repos", proSelected],
		queryFn: async () => {
			const res = await fetch(proReports[proSelected]);
			return res.json();
		},
		staleTime: 10 * 60 * 1000,
	});

	const filteredItems = useMemo(() => {
		return (
			data?.data.filter((repo) =>
				repo.name.toLowerCase().includes(openSourceFilterValue.toLowerCase())
			) || []
		);
	}, [data, openSourceFilterValue]);

	const sortedItems = useMemo(() => {
		return [...filteredItems].sort((a, b) => {
			const first = a[openSourceSortDescriptor.column as keyof RepoData];
			const second = b[openSourceSortDescriptor.column as keyof RepoData];
			const cmp =
				(parseInt(first as string) || first) <
				(parseInt(second as string) || second)
					? -1
					: 1;

			return openSourceSortDescriptor.direction === "descending" ? -cmp : cmp;
		});
	}, [filteredItems, openSourceSortDescriptor]);

	const filteredProItems = useMemo(() => {
		return (
			proData?.data.filter((repo) =>
				repo.name.toLowerCase().includes(proFilterValue.toLowerCase())
			) || []
		);
	}, [proData, proFilterValue]);

	const sortedProItems = useMemo(() => {
		return [...filteredProItems].sort((a, b) => {
			const first = a[proSortDescriptor.column as keyof ProData];
			const second = b[proSortDescriptor.column as keyof ProData];
			const cmp =
				(parseInt(first as string) || first) <
				(parseInt(second as string) || second)
					? -1
					: 1;

			return proSortDescriptor.direction === "descending" ? -cmp : cmp;
		});
	}, [filteredProItems, proSortDescriptor]);

	const renderCell = useCallback((repo: RepoData, columnKey: ReactKey) => {
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

	const renderProCell = useCallback((repo: ProData, columnKey: ReactKey) => {
		const cellValue = repo[columnKey as keyof ProData];

		switch (columnKey) {
			case "name":
				return (
					<div className="flex items-center gap-2">
						<div className="w-8 h-8 bg-gradient-to-br from-purple-500 to-pink-500 rounded-lg flex items-center justify-center text-white font-bold text-sm">
							{repo.name.charAt(0).toUpperCase()}
						</div>
						<span className="font-medium">{cellValue}</span>
					</div>
				);
			case "url":
				return (
					<a
						href={cellValue as string}
						target="_blank"
						rel="noopener noreferrer"
						className="text-blue-600 hover:text-blue-800 underline"
					>
						{cellValue}
					</a>
				);
			default:
				return cellValue;
		}
	}, []);

	const onOpenSourceSearchChange = useCallback((value: string) => {
		setOpenSourceFilterValue(value);
	}, []);

	const onProSearchChange = useCallback((value: string) => {
		setProFilterValue(value);
	}, []);

	const topContent = useMemo(() => {
		return (
			<div className="flex flex-col gap-4">
				<div className="flex flex-col sm:flex-row justify-between gap-3 items-end">
					<Autocomplete
						placeholder="Search a category..."
						className="w-full sm:max-w-[30%]"
						defaultItems={tabs}
						defaultSelectedKey={openSourceSelected}
						onSelectionChange={(key) => setOpenSourceSelected(key as string)}
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
						value={openSourceFilterValue}
						onValueChange={onOpenSourceSearchChange}
					/>
				</div>
			</div>
		);
	}, [openSourceFilterValue, onOpenSourceSearchChange, openSourceSelected]);

	const proTopContent = useMemo(() => {
		return (
			<div className="flex flex-col gap-4">
				<div className="flex flex-col sm:flex-row justify-between gap-3 items-end">
					<Autocomplete
						placeholder="Search a category..."
						className="w-full sm:max-w-[30%]"
						defaultItems={tabs}
						defaultSelectedKey={proSelected}
						onSelectionChange={(key) => setProSelected(key as string)}
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
						value={proFilterValue}
						onValueChange={onProSearchChange}
					/>
				</div>
			</div>
		);
	}, [proFilterValue, onProSearchChange, proSelected]);

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
	}, [data?.meta?.last_updated, isLoading]);

	const proBottomContent = useMemo(() => {
		const lastUpdatedDate = proData?.meta?.last_updated;
		return (
			<div className="py-2 px-2 flex justify-center">
				<p className="text-sm text-gray-600">
					{!isProLoading &&
						lastUpdatedDate &&
						`Last updated: ${formatDate(lastUpdatedDate)} (${formatDaysAgo(
							lastUpdatedDate
						)})`}
				</p>
			</div>
		);
	}, [proData?.meta?.last_updated, isProLoading]);

	return (
		<div className="space-y-8">
			{/* OpenSource Table */}
			<div>
				<h2 className="text-2xl font-bold mb-4 text-center">OpenSource</h2>
				<Table
					aria-label="OpenSource Repositories Table"
					isHeaderSticky
					bottomContent={bottomContent}
					bottomContentPlacement="outside"
					classNames={{
						wrapper: "max-h-[65dvh]",
					}}
					selectionMode="single"
					sortDescriptor={openSourceSortDescriptor}
					topContent={topContent}
					topContentPlacement="outside"
					onSortChange={(descriptor) =>
						setOpenSourceSortDescriptor({
							column: descriptor.column?.toString() as ReactKey,
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
			</div>

			{/* Pro Table */}
			<div>
				<h2 className="text-2xl font-bold mb-4 text-center">Pro</h2>
				<Table
					aria-label="Pro Repositories Table"
					isHeaderSticky
					bottomContent={proBottomContent}
					bottomContentPlacement="outside"
					classNames={{
						wrapper: "max-h-[65dvh]",
					}}
					selectionMode="single"
					sortDescriptor={proSortDescriptor}
					topContent={proTopContent}
					topContentPlacement="outside"
					onSortChange={(descriptor) =>
						setProSortDescriptor({
							column: descriptor.column?.toString() as ReactKey,
							direction: descriptor.direction as "ascending" | "descending",
						})
					}
					onRowAction={(key) => window.open(key as string, "_blank")}
				>
					<TableHeader columns={proColumns}>
						{(column) => (
							<TableColumn key={column.uid} allowsSorting={column.sortable}>
								{column.name}
							</TableColumn>
						)}
					</TableHeader>
					<TableBody
						emptyContent={"No pro repositories found"}
						isLoading={isProLoading}
						loadingContent={<Spinner label="Loading..." />}
						items={sortedProItems}
					>
						{(item) => (
							<TableRow key={item.url}>
								{(columnKey) => (
									<TableCell>{renderProCell(item, columnKey)}</TableCell>
								)}
							</TableRow>
						)}
					</TableBody>
				</Table>
			</div>
		</div>
	);
}
