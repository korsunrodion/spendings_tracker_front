"use client";

import { useState } from "react";
import { Reorder, useDragControls } from "framer-motion";
import {
  useCategoryGroups,
  useCreateCategoryGroup,
  useDeleteCategoryGroup,
  useRenameCategoryGroup,
  useUpdateCategoryGroupPositions,
} from "@/lib/hooks/useCategoryGroups";
import {
  useCreateCategory,
  useDeleteCategory,
  useUpdateCategoryBudget,
  useUpdateCategoryName,
  useUpdateCategoryPositions,
} from "@/lib/hooks/useCategories";
import type { Category, CategoryGroup } from "@/lib/schemas/category";
import {
  Button,
  Popover,
  PopoverContent,
  PopoverTrigger,
  Skeleton,
} from "@heroui/react";
import {
  MdAdd,
  MdCheck,
  MdClose,
  MdMoreVert,
  MdKeyboardArrowDown,
  MdChevronLeft,
  MdChevronRight,
  MdDragIndicator,
} from "react-icons/md";

const MONTHS = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];

function toDateString(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

function getMonthRange(date: Date) {
  const start = new Date(date.getFullYear(), date.getMonth(), 1);
  const end = new Date(date.getFullYear(), date.getMonth() + 1, 0);
  return { startDate: toDateString(start), endDate: toDateString(end) };
}

function formatMoney(n: number) {
  return `₴${Math.round(Math.abs(n)).toLocaleString()}`;
}

function getBarColor(percent: number) {
  if (percent >= 100) return "bg-red-500";
  if (percent >= 80) return "bg-orange-400";
  return "bg-violet-600";
}

function getPercentColor(percent: number) {
  if (percent >= 100) return "text-red-500";
  if (percent >= 80) return "text-orange-400";
  return "text-green-500";
}

const ICON_COLORS = [
  "bg-red-400",
  "bg-orange-400",
  "bg-violet-500",
  "bg-pink-400",
  "bg-blue-400",
  "bg-amber-500",
  "bg-indigo-500",
];

function getIconColor(name: string) {
  let h = 0;
  for (let i = 0; i < name.length; i++) h = name.charCodeAt(i) + ((h << 5) - h);
  return ICON_COLORS[Math.abs(h) % ICON_COLORS.length];
}

function CategoryRow({
  category,
  onDragHandlePointerDown,
  isIncome = false,
}: {
  category: Category;
  onDragHandlePointerDown?: (e: React.PointerEvent) => void;
  isIncome?: boolean;
}) {
  const { mutate: updateName } = useUpdateCategoryName();
  const { mutate: updateBudget } = useUpdateCategoryBudget();
  const { mutate: deleteCategory } = useDeleteCategory();

  const [isEditing, setIsEditing] = useState(false);
  const [editName, setEditName] = useState(category.name);
  const [editBudget, setEditBudget] = useState(String(category.budget ?? ""));
  const [menuOpen, setMenuOpen] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);

  const budget = category.budget ?? 0;
  const current = category.currentAmount ?? 0;
  const percent = budget > 0 ? Math.abs(current / budget) * 100 : 0;

  function handleSave() {
    const newName = editName.trim();
    if (newName && newName !== category.name) {
      updateName({ id: category._id, name: newName });
    }
    const newBudget = parseFloat(editBudget);
    if (!isNaN(newBudget) && newBudget !== category.budget) {
      updateBudget({ id: category._id, budget: newBudget });
    }
    setIsEditing(false);
  }

  function handleDelete() {
    deleteCategory(category._id);
    setMenuOpen(false);
  }

  if (isEditing) {
    return (
      <div className="flex items-center gap-2 px-4 py-3">
        <div
          className={`w-9 h-9 rounded-full flex-shrink-0 flex items-center justify-center ${getIconColor(
            category.name
          )}`}
        >
          <span className="text-white text-sm font-bold">
            {category.name[0].toUpperCase()}
          </span>
        </div>
        <input
          autoFocus
          value={editName}
          onChange={(e) => setEditName(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") handleSave();
            else if (e.key === "Escape") setIsEditing(false);
          }}
          className="flex-1 min-w-0 text-sm outline-none bg-gray-50 border border-gray-200 rounded-lg px-2 py-1 text-gray-800"
          placeholder="Name..."
        />
        <input
          type="number"
          value={editBudget}
          onChange={(e) => setEditBudget(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") handleSave();
            else if (e.key === "Escape") setIsEditing(false);
          }}
          className="w-20 flex-shrink-0 text-sm outline-none bg-gray-50 border border-gray-200 rounded-lg px-2 py-1 text-gray-800"
          placeholder="Budget"
        />
        <button
          onClick={handleSave}
          className="text-violet-600 p-0.5 flex-shrink-0 cursor-pointer"
        >
          <MdCheck size={18} />
        </button>
        <button
          onClick={() => setIsEditing(false)}
          className="text-gray-400 p-0.5 flex-shrink-0 cursor-pointer"
        >
          <MdClose size={18} />
        </button>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-3 px-4 py-3">
      <MdDragIndicator
        size={16}
        className="text-gray-300 cursor-grab flex-shrink-0 touch-none"
        onPointerDown={onDragHandlePointerDown}
      />

      <div
        className={`w-9 h-9 rounded-full flex-shrink-0 flex items-center justify-center ${getIconColor(
          category.name
        )}`}
      >
        <span className="text-white text-sm font-bold">
          {category.name[0].toUpperCase()}
        </span>
      </div>

      <span className="text-sm font-medium text-gray-800 w-[90px] flex-shrink-0 truncate">
        {category.name}
      </span>

      {isIncome ? (
        <div className="flex-1 min-w-0 flex justify-end pr-1">
          <span className="text-sm font-semibold text-green-600">
            +{formatMoney(current)}
          </span>
        </div>
      ) : (
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-xs font-medium text-violet-600">
              {formatMoney(current)} of {formatMoney(budget)}
            </span>
            <span
              className={`text-xs font-semibold ${getPercentColor(percent)}`}
            >
              {Math.round(percent)}%
            </span>
          </div>
          <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
            <div
              className={`h-full rounded-full ${getBarColor(percent)}`}
              style={{ width: `${Math.min(percent, 100)}%` }}
            />
          </div>
        </div>
      )}

      <Popover
        isOpen={menuOpen}
        onOpenChange={(o) => {
          setMenuOpen(o);
          if (!o) setConfirmDelete(false);
        }}
        placement="left-start"
      >
        <PopoverTrigger>
          <button className="cursor-pointer text-gray-400 flex-shrink-0 p-0.5 hover:text-gray-600">
            <MdMoreVert size={18} />
          </button>
        </PopoverTrigger>
        <PopoverContent className="p-1 min-w-[130px]">
          {!confirmDelete ? (
            <div className="flex flex-col w-full">
              <button
                onClick={() => {
                  setIsEditing(true);
                  setMenuOpen(false);
                }}
                className="cursor-pointer px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 rounded-lg w-full text-left"
              >
                Edit
              </button>
              <button
                onClick={() => setConfirmDelete(true)}
                className="cursor-pointer px-3 py-2 text-sm text-red-500 hover:bg-red-50 rounded-lg w-full text-left"
              >
                Delete
              </button>
            </div>
          ) : (
            <div className="flex flex-col gap-2 p-2">
              <span className="text-xs text-gray-600">
                Delete this category?
              </span>
              <div className="flex gap-1.5">
                <button
                  onClick={handleDelete}
                  className="flex-1 text-xs bg-red-500 text-white rounded-lg py-1.5 font-medium cursor-pointer"
                >
                  Delete
                </button>
                <button
                  onClick={() => setConfirmDelete(false)}
                  className="flex-1 text-xs bg-gray-100 text-gray-700 rounded-lg py-1.5 font-medium cursor-pointer"
                >
                  Cancel
                </button>
              </div>
            </div>
          )}
        </PopoverContent>
      </Popover>
    </div>
  );
}

function AddCategoryInput({
  onSubmit,
  onCancel,
}: {
  onSubmit: (name: string) => void;
  onCancel: () => void;
}) {
  const [value, setValue] = useState("");

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === "Enter" && value.trim()) onSubmit(value.trim());
    else if (e.key === "Escape") onCancel();
  }

  return (
    <div className="flex items-center gap-3 px-4 py-2.5">
      <div className="w-9 h-9 rounded-full bg-gray-100 flex-shrink-0 flex items-center justify-center">
        <MdAdd size={16} className="text-gray-400" />
      </div>
      <input
        autoFocus
        value={value}
        onChange={(e) => setValue(e.target.value)}
        onKeyDown={handleKeyDown}
        placeholder="Category name..."
        className="cursor-pointer flex-1 min-w-0 text-sm outline-none bg-transparent text-gray-800 placeholder-gray-400"
      />
      <button
        onClick={() => value.trim() && onSubmit(value.trim())}
        disabled={!value.trim()}
        className="text-violet-600 p-0.5 disabled:opacity-30 cursor-pointer"
      >
        <MdCheck size={18} />
      </button>
      <button onClick={onCancel} className="text-gray-400 p-0.5 cursor-pointer">
        <MdClose size={18} />
      </button>
    </div>
  );
}

function AddGroupInput({
  onSubmit,
  onCancel,
}: {
  onSubmit: (name: string) => void;
  onCancel: () => void;
}) {
  const [value, setValue] = useState("");

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === "Enter" && value.trim()) onSubmit(value.trim());
    else if (e.key === "Escape") onCancel();
  }

  return (
    <div className="bg-white rounded-2xl shadow-sm border-2 border-violet-300 px-4 py-3 flex items-center gap-2">
      <input
        autoFocus
        value={value}
        onChange={(e) => setValue(e.target.value)}
        onKeyDown={handleKeyDown}
        placeholder="Group name..."
        className="cursor-pointer flex-1 min-w-0 text-sm font-medium outline-none bg-transparent text-gray-800 placeholder-gray-400"
      />
      <button
        onClick={() => value.trim() && onSubmit(value.trim())}
        disabled={!value.trim()}
        className="text-violet-600 p-0.5 disabled:opacity-30 cursor-pointer"
      >
        <MdCheck size={18} />
      </button>
      <button onClick={onCancel} className="text-gray-400 p-0.5 cursor-pointer">
        <MdClose size={18} />
      </button>
    </div>
  );
}

function DraggableCategoryRow({
  category,
  onDragEnd,
  isIncome = false,
}: {
  category: Category;
  onDragEnd: () => void;
  isIncome?: boolean;
}) {
  const controls = useDragControls();

  return (
    <Reorder.Item
      as="div"
      value={category}
      dragListener={false}
      dragControls={controls}
      onDragEnd={onDragEnd}
      className="list-none"
    >
      <CategoryRow
        category={category}
        isIncome={isIncome}
        onDragHandlePointerDown={(e) => {
          e.preventDefault();
          controls.start(e);
        }}
      />
    </Reorder.Item>
  );
}

function CategoryRowSkeleton() {
  return (
    <div className="flex items-center gap-3 px-4 py-3">
      <Skeleton className="w-9 h-9 rounded-full flex-shrink-0" />
      <Skeleton className="h-4 w-20 rounded flex-shrink-0" />
      <div className="flex-1">
        <div className="flex justify-between mb-1.5">
          <Skeleton className="h-3 w-24 rounded" />
          <Skeleton className="h-3 w-8 rounded" />
        </div>
        <Skeleton className="h-1.5 w-full rounded-full" />
      </div>
    </div>
  );
}

function GroupSkeleton() {
  return (
    <div className="bg-white rounded-2xl overflow-hidden shadow-sm">
      <div className="flex items-center gap-3 px-4 py-3">
        <Skeleton className="h-3 w-3 rounded flex-shrink-0" />
        <Skeleton className="h-3 w-32 rounded" />
        <Skeleton className="h-5 w-24 rounded-full" />
        <div className="flex-1" />
        <Skeleton className="h-4 w-24 rounded" />
      </div>
      <div className="border-t border-gray-100 divide-y divide-gray-100">
        {[1, 2, 3].map((i) => (
          <CategoryRowSkeleton key={i} />
        ))}
      </div>
    </div>
  );
}

function CategoryGroupCard({
  group,
  onDragHandlePointerDown,
}: {
  group: CategoryGroup;
  onDragHandlePointerDown?: (e: React.PointerEvent) => void;
}) {
  const { mutate: createCategory } = useCreateCategory();
  const { mutate: updateCategoryPositions } = useUpdateCategoryPositions();
  const { mutate: renameGroup } = useRenameCategoryGroup();
  const { mutate: deleteGroup } = useDeleteCategoryGroup();

  const [isAddingCategory, setIsAddingCategory] = useState(false);
  const [isEditingName, setIsEditingName] = useState(false);
  const [editGroupName, setEditGroupName] = useState(group.name);
  const [groupMenuOpen, setGroupMenuOpen] = useState(false);
  const [confirmDeleteGroup, setConfirmDeleteGroup] = useState(false);

  const sorted = [...group.categories].sort(
    (a, b) => (a.position ?? 0) - (b.position ?? 0)
  );
  const [prevGroup, setPrevGroup] = useState(group);
  const [orderedCategories, setOrderedCategories] = useState(sorted);

  if (group !== prevGroup) {
    setPrevGroup(group);
    setOrderedCategories(
      [...group.categories].sort(
        (a, b) => (a.position ?? 0) - (b.position ?? 0)
      )
    );
  }

  const totalBudget = orderedCategories.reduce(
    (sum, c) => sum + (c.budget ?? 0),
    0
  );
  const totalCurrent = orderedCategories.reduce(
    (sum, c) => sum + (c.currentAmount ?? 0),
    0
  );

  function handleCategoryDragEnd() {
    updateCategoryPositions({
      groupId: group._id,
      positions: orderedCategories.map((c, i) => ({
        id: c._id,
        position: i + 1,
      })),
    });
  }

  function handleGroupSave() {
    const newName = editGroupName.trim();
    if (newName && newName !== group.name) {
      renameGroup({ id: group._id, name: newName });
    }
    setIsEditingName(false);
  }

  function handleGroupDelete() {
    deleteGroup(group._id);
    setGroupMenuOpen(false);
  }

  const isIncome = group.type === "income";

  return (
    <div
      className={`rounded-2xl overflow-hidden shadow-sm ${
        isIncome ? "bg-green-50" : "bg-white"
      }`}
    >
      {/* Group header */}
      {isEditingName ? (
        <div className="flex items-center gap-2 px-4 py-3">
          <MdDragIndicator
            size={18}
            className="text-gray-300 cursor-grab flex-shrink-0 touch-none"
            onPointerDown={onDragHandlePointerDown}
          />
          <input
            autoFocus
            value={editGroupName}
            onChange={(e) => setEditGroupName(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") handleGroupSave();
              else if (e.key === "Escape") setIsEditingName(false);
            }}
            className="cursor-pointer flex-1 min-w-0 text-xs font-bold tracking-widest uppercase outline-none bg-gray-50 border border-gray-200 rounded-lg px-2 py-1 text-gray-500"
          />
          <button
            onClick={handleGroupSave}
            className="text-violet-600 p-0.5 flex-shrink-0 cursor-pointer"
          >
            <MdCheck size={18} />
          </button>
          <button
            onClick={() => setIsEditingName(false)}
            className="cursor-pointer text-gray-400 p-0.5 flex-shrink-0 cursor-pointer"
          >
            <MdClose size={18} />
          </button>
        </div>
      ) : (
        <div className="flex items-center gap-2 px-4 py-3">
          <MdDragIndicator
            size={18}
            className="text-gray-300 cursor-grab flex-shrink-0 touch-none"
            onPointerDown={onDragHandlePointerDown}
          />
          <span className="text-xs font-bold tracking-widest text-gray-500 uppercase">
            {group.name}
          </span>
          <span className="text-xs bg-violet-100 text-violet-700 font-medium px-2 py-0.5 rounded-full flex-shrink-0">
            {orderedCategories.length}{" "}
            {orderedCategories.length === 1 ? "Category" : "Categories"}
          </span>
          <div className="flex-1" />
          <span className="text-sm font-semibold text-gray-700 flex-shrink-0">
            {formatMoney(totalCurrent)} / {formatMoney(totalBudget)}
          </span>
          <Popover
            isOpen={groupMenuOpen}
            onOpenChange={(o) => {
              setGroupMenuOpen(o);
              if (!o) setConfirmDeleteGroup(false);
            }}
            placement="left-start"
          >
            <PopoverTrigger>
              <button className="cursor-pointer text-gray-400 p-0.5 hover:text-gray-600 flex-shrink-0">
                <MdMoreVert size={18} />
              </button>
            </PopoverTrigger>
            <PopoverContent className="p-1 min-w-[130px]">
              {!confirmDeleteGroup ? (
                <div className="flex flex-col w-full">
                  <button
                    onClick={() => {
                      setIsEditingName(true);
                      setGroupMenuOpen(false);
                    }}
                    className="px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 rounded-lg w-full text-left"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => setConfirmDeleteGroup(true)}
                    className="px-3 py-2 text-sm text-red-500 hover:bg-red-50 rounded-lg w-full text-left"
                  >
                    Delete
                  </button>
                </div>
              ) : (
                <div className="flex flex-col gap-2 p-2">
                  <span className="text-xs text-gray-600">
                    Delete this group?
                  </span>
                  <div className="flex gap-1.5">
                    <button
                      onClick={handleGroupDelete}
                      className="flex-1 text-xs bg-red-500 text-white rounded-lg py-1.5 font-medium cursor-pointer"
                    >
                      Delete
                    </button>
                    <button
                      onClick={() => setConfirmDeleteGroup(false)}
                      className="flex-1 text-xs bg-gray-100 text-gray-700 rounded-lg py-1.5 font-medium cursor-pointer"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              )}
            </PopoverContent>
          </Popover>
        </div>
      )}

      <Reorder.Group
        as="div"
        axis="y"
        values={orderedCategories}
        onReorder={setOrderedCategories}
        className="border-t border-gray-100 divide-y divide-gray-100 select-none"
      >
        {orderedCategories.map((cat) => (
          <DraggableCategoryRow
            key={cat._id}
            category={cat}
            isIncome={isIncome}
            onDragEnd={handleCategoryDragEnd}
          />
        ))}
      </Reorder.Group>

      <div className="border-t border-gray-100">
        {isAddingCategory ? (
          <AddCategoryInput
            onSubmit={(name) =>
              createCategory(
                { name, groupId: group._id },
                { onSuccess: () => setIsAddingCategory(false) }
              )
            }
            onCancel={() => setIsAddingCategory(false)}
          />
        ) : (
          <div className="px-4 py-2.5">
            <button
              onClick={() => setIsAddingCategory(true)}
              className="flex items-center gap-1 text-sm text-violet-600 font-medium hover:text-violet-700 transition-colors"
            >
              <MdAdd size={16} />
              <span>Add Category to Group</span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

function DraggableGroupCard({
  group,
  onDragEnd,
}: {
  group: CategoryGroup;
  onDragEnd: () => void;
}) {
  const controls = useDragControls();

  return (
    <Reorder.Item
      as="div"
      value={group}
      dragListener={false}
      dragControls={controls}
      onDragEnd={onDragEnd}
      className="list-none"
    >
      <CategoryGroupCard
        group={group}
        onDragHandlePointerDown={(e) => {
          e.preventDefault();
          controls.start(e);
        }}
      />
    </Reorder.Item>
  );
}

export default function CategoriesPage() {
  const [selectedDate, setSelectedDate] = useState(
    () => new Date(new Date().getFullYear(), new Date().getMonth(), 1)
  );

  const { startDate, endDate } = getMonthRange(selectedDate);
  const monthLabel = `${
    MONTHS[selectedDate.getMonth()]
  } ${selectedDate.getFullYear()}`;

  const { data: groups, isLoading: groupsLoading } = useCategoryGroups({
    startDate,
    endDate,
  });
  const { mutate: createGroup } = useCreateCategoryGroup();
  const { mutate: updateGroupPositions } = useUpdateCategoryGroupPositions();
  const [isAddingGroup, setIsAddingGroup] = useState(false);

  const [prevGroups, setPrevGroups] = useState(groups);
  const [orderedGroups, setOrderedGroups] = useState<CategoryGroup[]>(() =>
    [...(groups ?? [])].sort((a, b) => a.position - b.position)
  );

  if (groups !== prevGroups) {
    setPrevGroups(groups);
    setOrderedGroups(
      [...(groups ?? [])].sort((a, b) => a.position - b.position)
    );
  }

  function handleDragEnd() {
    updateGroupPositions(
      orderedGroups.map((g, i) => ({ _id: g._id, position: i + 1 }))
    );
  }

  return (
    <div className="flex flex-col min-h-full bg-[#f5f3ff]">
      {/* Top navbar */}
      <div className="bg-white">
        <div className="flex items-center justify-between py-6 max-w-[1024px] mx-auto">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-violet-600 rounded-lg flex items-center justify-center flex-shrink-0">
              <span className="text-white text-xs font-bold">FF</span>
            </div>
            <span className="font-semibold text-gray-900">FinanceFlow</span>
          </div>
          <div className="flex items-center gap-2">
            <Button
              size="sm"
              variant="bordered"
              color="secondary"
              startContent={<MdAdd size={15} />}
              onPress={() => setIsAddingGroup(true)}
            >
              Add Group
            </Button>
            <div className="w-8 h-8 bg-amber-200 rounded-full flex-shrink-0" />
          </div>
        </div>
      </div>

      {/* Page header */}
      <div className="mx-auto max-w-[1024px] w-full">
        <div className="px-4 pt-5 pb-4">
          <div className="flex items-start justify-between gap-3">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                Category Management
              </h1>
              <p className="text-sm text-violet-600 mt-0.5">
                Organize your spending into groups
              </p>
            </div>
            <Popover placement="bottom-end">
              <PopoverTrigger>
                <button className="flex items-center gap-1 text-sm font-medium text-gray-700 bg-white border border-gray-200 rounded-lg px-3 py-1.5 shadow-sm flex-shrink-0 mt-1">
                  {monthLabel}
                  <MdKeyboardArrowDown size={16} />
                </button>
              </PopoverTrigger>
              <PopoverContent>
                <div className="flex items-center gap-2 px-1 py-1">
                  <button
                    className="p-1 rounded hover:bg-gray-100 text-gray-600"
                    onClick={() =>
                      setSelectedDate(
                        (d) => new Date(d.getFullYear(), d.getMonth() - 1, 1)
                      )
                    }
                  >
                    <MdChevronLeft size={20} />
                  </button>
                  <span className="text-sm font-medium w-32 text-center text-black">
                    {monthLabel}
                  </span>
                  <button
                    className="p-1 rounded hover:bg-gray-100 text-gray-600"
                    onClick={() =>
                      setSelectedDate(
                        (d) => new Date(d.getFullYear(), d.getMonth() + 1, 1)
                      )
                    }
                  >
                    <MdChevronRight size={20} />
                  </button>
                </div>
              </PopoverContent>
            </Popover>
          </div>
        </div>

        {/* Groups list */}
        <div className="flex flex-col gap-3 px-4 pb-6">
          {groupsLoading ? (
            <>
              <GroupSkeleton />
              <GroupSkeleton />
            </>
          ) : (
            <>
              <Reorder.Group
                as="div"
                axis="y"
                values={orderedGroups}
                onReorder={setOrderedGroups}
                className="flex flex-col gap-3 select-none"
              >
                {orderedGroups.map((group) => (
                  <DraggableGroupCard
                    key={group._id}
                    group={group}
                    onDragEnd={handleDragEnd}
                  />
                ))}
              </Reorder.Group>

              {/* Add group */}
              {isAddingGroup ? (
                <AddGroupInput
                  onSubmit={(name) =>
                    createGroup(name, {
                      onSuccess: () => setIsAddingGroup(false),
                    })
                  }
                  onCancel={() => setIsAddingGroup(false)}
                />
              ) : (
                <button
                  onClick={() => setIsAddingGroup(true)}
                  className="border-2 border-dashed border-violet-200 rounded-2xl p-6 flex flex-col items-center gap-2 text-violet-400 hover:border-violet-300 hover:text-violet-500 transition-colors"
                >
                  <div className="w-10 h-10 rounded-full bg-violet-50 flex items-center justify-center">
                    <MdAdd size={22} className="text-violet-400" />
                  </div>
                  <span className="text-sm font-medium">
                    Create Category Group
                  </span>
                </button>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
