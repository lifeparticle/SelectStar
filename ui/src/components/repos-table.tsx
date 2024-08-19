import {
	Table,
	TableHeader,
	TableColumn,
	TableBody,
	TableRow,
	TableCell,
	Input,
	User,
	Pagination,
	Spinner,
	Button,
} from "@nextui-org/react";
import { useAsyncList } from "@react-stately/data";
import Papa from "papaparse";
import {
	ChangeEvent,
	Key,
	useCallback,
	useEffect,
	useMemo,
	useState,
} from "react";

export function formatDate(dateString: string): string {
	const dateObject = new Date(dateString);

	const formatDate = new Intl.DateTimeFormat("en-GB", {
		dateStyle: "long",
		timeZone: "Australia/Sydney",
	}).format(dateObject);

	return formatDate;
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
	stargazers_count: string;
	updated_at: string;
}

const columns = [
	{ name: "Name", uid: "name", sortable: true },
	{ name: "Description", uid: "description", sortable: false },
	{ name: "Stargazers count", uid: "stargazers_count", sortable: true },
	{ name: "Created at", uid: "created_at", sortable: true },
	{ name: "Pushed at", uid: "pushed_at", sortable: true },
	{ name: "Updated at", uid: "updated_at", sortable: true },
];

interface ReposTableProps {
	url: string;
}

export default function ReposTable({ url }: ReposTableProps) {
	const [filterValue, setFilterValue] = useState("");
	const [rowsPerPage, setRowsPerPage] = useState(50);
	const [sortDescriptor, setSortDescriptor] = useState<CustomSortDescriptor>({
		column: "stargazers_count",
		direction: "descending",
	});

	const [page, setPage] = useState(1);
	const [isLoading, setIsLoading] = useState(true);

	const list = useAsyncList<RepoData>({
		async load({ signal }) {
			let res = await fetch(url, {
				signal,
			});
			const csvText = await res.text();
			const parsedData = Papa.parse<RepoData>(csvText, {
				header: true,
				skipEmptyLines: true,
			});

			const items = parsedData.data.map((item) => ({
				html_url: item.html_url,
				name: item.name,
				description: item.description,
				owner_avatar_url: item.owner_avatar_url,
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
	});

	useEffect(() => {
		list.reload();
	}, [url]);

	const filteredItems = useMemo(() => {
		return list.items.filter((repo) =>
			repo.name.toLowerCase().includes(filterValue.toLowerCase())
		);
	}, [list.items, filterValue]);

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
				return formatDate(cellValue);
			default:
				return cellValue;
		}
	}, []);

	const onSearchChange = useCallback((value: string) => {
		setFilterValue(value);
		setPage(1);
	}, []);

	const onRowsPerPageChange = useCallback(
		(e: ChangeEvent<HTMLSelectElement>) => {
			setRowsPerPage(Number(e.target.value));
			setPage(1);
		},
		[]
	);

	const pages = Math.ceil(filteredItems.length / rowsPerPage);

	const topContent = useMemo(() => {
		return (
			<div className="flex flex-col gap-4">
				<div className="flex justify-between gap-3 items-end">
					<Input
						className="w-full sm:max-w-[44%]"
						isClearable
						placeholder="Search by name..."
						size="md"
						value={filterValue}
						onValueChange={onSearchChange}
					/>
					<div className="flex gap-3">
						<label className="flex items-center text-default-400 text-small">
							Rows per page:
							<select
								className="bg-transparent outline-none text-default-400 text-small ml-1"
								onChange={onRowsPerPageChange}
							>
								<option value="5">5</option>
								<option value="20">20</option>
								<option value="50">50</option>
								<option value="100">100</option>
								<option value="200">300</option>
							</select>
						</label>
					</div>
				</div>
			</div>
		);
	}, [filterValue, onRowsPerPageChange, onSearchChange]);

	const onNextPage = useCallback(() => {
		if (page < pages) {
			setPage(page + 1);
		}
	}, [page, pages]);

	const onPreviousPage = useCallback(() => {
		if (page > 1) {
			setPage(page - 1);
		}
	}, [page]);

	const bottomContent = useMemo(() => {
		return (
			<div className="py-2 px-2 flex justify-between items-center">
				<Pagination
					isCompact
					showControls
					showShadow
					color="primary"
					page={page}
					total={pages}
					onChange={setPage}
				/>
				<div className="hidden sm:flex w-[30%] justify-end gap-2">
					<Button
						isDisabled={pages === 1}
						size="sm"
						variant="flat"
						onPress={onPreviousPage}
					>
						Previous
					</Button>
					<Button
						isDisabled={pages === 1}
						size="sm"
						variant="flat"
						onPress={onNextPage}
					>
						Next
					</Button>
				</div>
			</div>
		);
	}, [sortedItems.length, page, pages]);

	return (
		<Table
			aria-label="Repositories Table"
			isHeaderSticky
			bottomContent={bottomContent}
			bottomContentPlacement="outside"
			classNames={{
				wrapper: "max-h-[500px]",
			}}
			sortDescriptor={sortDescriptor}
			topContent={topContent}
			topContentPlacement="outside"
			onSortChange={(descriptor) =>
				setSortDescriptor({
					column: descriptor.column?.toString(),
					direction: descriptor.direction as "ascending" | "descending",
				})
			}
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
