import {
  Box,
  Button,
  Checkbox,
  Container,
  Grid,
  Group,
  Loader,
  Pagination,
  Select,
  SimpleGrid,
  Stack,
  Switch,
  Text,
  TextInput,
  Title,
} from "@mantine/core";
import {
  IconSearch,
  IconLayoutGrid,
  IconList,
  IconChevronDown,
  IconChevronUp,
} from "@tabler/icons-react";
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { getItems } from "../../api/itemsApi";
import AdCard from "../../components/AdCard/AdCard";
import { useDebounce } from "../../hooks/useDebounce";

const CATEGORIES = [
  { value: "auto", label: "Авто" },
  { value: "electronics", label: "Электроника" },
  { value: "real_estate", label: "Недвижимость" },
];

const LIMIT = 10;

export default function AdsListPage() {
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [needsRevision, setNeedsRevision] = useState(false);
  const [sortColumn, setSortColumn] = useState<"createdAt" | "title">(
    "createdAt",
  );
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("desc");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");

  const debouncedSearch = useDebounce(search, 400);

  const { data, isLoading, isError } = useQuery({
    queryKey: [
      "items",
      debouncedSearch,
      page,
      selectedCategories,
      needsRevision,
      sortColumn,
      sortDirection,
    ],
    queryFn: () =>
      getItems({
        q: debouncedSearch || undefined,
        limit: LIMIT,
        skip: (page - 1) * LIMIT,
        categories: selectedCategories.length
          ? selectedCategories.join(",")
          : undefined,
        needsRevision: needsRevision || undefined,
        sortColumn,
        sortDirection,
      }),
  });

  const totalPages = data ? Math.ceil(data.total / LIMIT) : 1;

  const handleCategoryToggle = (value: string) => {
    setSelectedCategories((prev) =>
      prev.includes(value) ? prev.filter((c) => c !== value) : [...prev, value],
    );
    setPage(1);
  };

  const handleReset = () => {
    setSelectedCategories([]);
    setNeedsRevision(false);
    setPage(1);
  };

  return (
    <Box style={{ minHeight: "100vh" }}>
      <Box bg="#F7F5F8">
        <Container size="xl" py={0} mt={16}>
          <Title order={1} fw={500}>
            Мои объявления
          </Title>
          <Text c="dimmed">{data?.total ?? 0} объявления</Text>
        </Container>
      </Box>

      <Container size="xl" py="xl">
        <Box
          bg="white"
          pl={12}
          pr={12}
          style={{
            borderRadius: 8,
            height: 56,
            display: "flex",
            alignItems: "center",
          }}
          mb="xl"
        >
          <Group w="100%" gap={24} justify="space-between">
            <TextInput
              placeholder="Найти объявление..."
              rightSection={<IconSearch size={14} color="#707176" />}
              value={search}
              onChange={(e) => {
                setSearch(e.currentTarget.value);
                setPage(1);
              }}
              style={{ flex: 1 }}
              styles={{
                input: { backgroundColor: "#F6F6F8", color: "#707176" },
              }}
            />

            <Group gap={16}>
              <Group
                gap={0}
                style={{
                  backgroundColor: "#f0f0f0",
                  borderRadius: 6,
                  overflow: "hidden",
                }}
              >
                <Button
                  variant="subtle"
                  px="xs"
                  style={{ backgroundColor: "transparent" }}
                  onClick={() => setViewMode("grid")}
                >
                  <IconLayoutGrid
                    size={20}
                    color={viewMode === "grid" ? "#1890FF" : "#888888"}
                  />
                </Button>
                <Box
                  style={{ width: 1.8, height: 30, backgroundColor: "#FFFFFF" }}
                />
                <Button
                  variant="subtle"
                  px="xs"
                  style={{ backgroundColor: "transparent" }}
                  onClick={() => setViewMode("list")}
                >
                  <IconList
                    size={22}
                    color={viewMode === "list" ? "#1890FF" : "#000000D9"}
                  />
                </Button>
              </Group>

              <Select
                value={`${sortColumn}_${sortDirection}`}
                onChange={(val) => {
                  if (!val) return;
                  const [col, dir] = val.split("_");
                  setSortColumn(col as "createdAt" | "title");
                  setSortDirection(dir as "asc" | "desc");
                }}
                rightSection={<IconChevronDown size={16} />}
                data={[
                  {
                    value: "createdAt_desc",
                    label: "По новизне (сначала новые)",
                  },
                  {
                    value: "createdAt_asc",
                    label: "По новизне (сначала старые)",
                  },
                  { value: "title_asc", label: "По названию (А-Я)" },
                  { value: "title_desc", label: "По названию (Я-А)" },
                ]}
                w={248}
                styles={{
                  input: {
                    backgroundColor: "#ffffff",
                    border: "1px solid #e9ecef",
                    fontSize: "14",
                  },
                  wrapper: {
                    backgroundColor: "#f0f0f0",
                    borderRadius: 8,
                    padding: 3,
                  },
                }}
              />
            </Group>
          </Group>
        </Box>
        <Grid>
          <Grid.Col span="content" style={{ width: 256 }}>
            <Stack gap={10}>
              <Box
                p="md"
                bg="white"
                style={{
                  border: "1px solid #e9ecef",
                  borderRadius: 8,
                  minHeight: 247,
                }}
              >
                <Text fw={600} mb="sm" size="md">
                  Фильтры
                </Text>
                <Group w="100%" gap="sm" justify="space-between">
                  <Text size="sm" fw={500}>
                    Категория
                  </Text>
                  <IconChevronUp size={16} color="gray" />
                </Group>
                <Stack gap="xs" mb="md">
                  {CATEGORIES.map((cat) => (
                    <Checkbox
                      key={cat.value}
                      label={cat.label}
                      checked={selectedCategories.includes(cat.value)}
                      onChange={() => handleCategoryToggle(cat.value)}
                    />
                  ))}
                </Stack>
                <Box
                  style={{
                    borderBottom: "1px solid #F0F0F0",
                    width: 224,
                    my: 8,
                  }}
                  mb="md"
                />

                {/* Переключатель — текст слева, toggle справа */}
                <Group justify="space-between" mb="xl">
                  <Text size="sm" fw={600} style={{ maxWidth: 160 }}>
                    Только требующие доработок
                  </Text>
                  <Switch
                    checked={needsRevision}
                    onChange={(e) => {
                      setNeedsRevision(e.currentTarget.checked);
                      setPage(1);
                    }}
                  />
                </Group>
              </Box>

              <Button
                variant="subtle"
                color="#848388    "
                size="sm"
                fullWidth
                bg="white"
                onClick={handleReset}
              >
                Сбросить фильтры
              </Button>
            </Stack>
          </Grid.Col>

          <Grid.Col span="auto">
            {isLoading && (
              <Group justify="center" mt="xl">
                <Loader />
              </Group>
            )}

            {isError && (
              <Text c="red" ta="center" mt="xl">
                Ошибка загрузки объявлений
              </Text>
            )}

            {!isLoading && !isError && data?.items.length === 0 && (
              <Text c="dimmed" ta="center" mt="xl">
                Объявления не найдены
              </Text>
            )}

            {!isLoading && !isError && (
              <SimpleGrid cols={viewMode === "grid" ? 5 : 1} spacing="md">
                {data?.items.map((item) => (
                  <AdCard key={item.id} item={item} />
                ))}
              </SimpleGrid>
            )}

            {totalPages > 1 && (
              <Group justify="center" mt="xl">
                <Pagination
                  value={page}
                  onChange={setPage}
                  total={totalPages}
                />
              </Group>
            )}
          </Grid.Col>
        </Grid>
      </Container>
    </Box>
  );
}
