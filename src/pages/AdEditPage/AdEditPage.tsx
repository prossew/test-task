import {
  Box,
  Button,
  Container,
  Group,
  Loader,
  Select,
  Text,
  Textarea,
  TextInput,
  Title,
} from "@mantine/core";
import { notifications } from "@mantine/notifications";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { getItemById, updateItem } from "../../api/itemsApi";
import ClearableInput from "../../components/ClearableInput/ClearableInput";
import { IconChevronDown } from "@tabler/icons-react";
import type { Category } from "../../types/item";
import { improveDescription, getMarketPrice } from "../../api/llmApi";

const CATEGORY_OPTIONS = [
  { value: "auto", label: "Авто" },
  { value: "real_estate", label: "Недвижимость" },
  { value: "electronics", label: "Электроника" },
];

export default function AdEditPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const {
    data: item,
    isLoading,
    isError,
  } = useQuery({
    queryKey: ["item", id],
    queryFn: () => getItemById(id!),
    enabled: !!id,
  });

  const [category, setCategory] = useState<Category>("electronics");
  const [title, setTitle] = useState("");
  const [price, setPrice] = useState("");
  const [description, setDescription] = useState("");
  const [params, setParams] = useState<Record<string, string>>({});
  const [initialized, setInitialized] = useState(false);
  const [isImprovingDescription, setIsImprovingDescription] = useState(false);
  const [isGettingPrice, setIsGettingPrice] = useState(false);
  const [descriptionSuggestion, setDescriptionSuggestion] = useState<
    string | null
  >(null);
  const [priceSuggestion, setPriceSuggestion] = useState<string | null>(null);
  const [descriptionError, setDescriptionError] = useState(false);
  const [priceError, setPriceError] = useState(false);

  useEffect(() => {
    if (item) {
      setCategory(item.category);
      setTitle(item.title);
      setPrice(String(item.price ?? ""));
      setDescription(item.description ?? "");
      const p: Record<string, string> = {};
      Object.entries(item.params).forEach(([k, v]) => {
        if (v !== undefined && v !== null) p[k] = String(v);
      });
      const draft = localStorage.getItem(`draft_${id}`);
      if (draft) {
        const parsed = JSON.parse(draft);
        setTitle(parsed.title ?? item.title);
        setPrice(parsed.price ?? String(item.price));
        setDescription(parsed.description ?? item.description ?? "");
        setParams(parsed.params ?? p);
      } else {
        setParams(p);
      }
      setInitialized(true);
    }
  }, [item, id]);

  useEffect(() => {
    if (!id || !initialized) return;
    localStorage.setItem(
      `draft_${id}`,
      JSON.stringify({ title, price, description, params })
    );
  }, [title, price, description, params, id, initialized]);

  const { mutate, isPending } = useMutation({
    mutationFn: () =>
      updateItem(id!, {
        category,
        title,
        price: Number(price),
        description: description || undefined,
        params: params as any,
      }),
    onSuccess: () => {
      localStorage.removeItem(`draft_${id}`);
      queryClient.invalidateQueries({ queryKey: ["item", id] });
      notifications.show({
        title: "Изменения сохранены",
        message: "",
        color: "green",
      });
      navigate(`/ads/${id}`);
    },
    onError: () => {
      notifications.show({
        title: "Ошибка сохранения",
        message: "Попробуйте ещё раз или зайдите позже.",
        color: "red",
      });
    },
  });

  const isValid =
    title.trim() !== "" && price.trim() !== "" && Number(price) > 0;
  const updateParam = (key: string, value: string) =>
    setParams((prev) => ({ ...prev, [key]: value }));

  const handleImproveDescription = async () => {
    setIsImprovingDescription(true);
    setDescriptionError(false);
    setDescriptionSuggestion(null);
    try {
      const result = await improveDescription({
        title,
        category,
        description,
        price,
        params,
      });
      setDescriptionSuggestion(result);
    } catch {
      setDescriptionError(true);
    } finally {
      setIsImprovingDescription(false);
    }
  };

  const handleGetPrice = async () => {
    setIsGettingPrice(true);
    setPriceError(false);
    setPriceSuggestion(null);
    try {
      const result = await getMarketPrice({
        title,
        category,
        description,
        price,
        params,
      });
      setPriceSuggestion(result);
    } catch {
      setPriceError(true);
    } finally {
      setIsGettingPrice(false);
    }
  };

  if (isLoading)
    return (
      <Container size="xl" py="xl">
        <Loader />
      </Container>
    );

  if (isError || !item)
    return (
      <Container size="xl" py="xl">
        <Text c="red" ta="center">
          Ошибка загрузки объявления
        </Text>
      </Container>
    );
    
  return (
    <Box style={{ minHeight: "100vh" }}>
      <Container size="xl" py="xl">
        <Box bg="white" p="xl" style={{ borderRadius: 8, maxWidth: 1103 }}>
          <Title order={1} fw={500} mb={18}>
            Редактирование объявления
          </Title>

          <Text fw={500} mb={4}>
            Категория
          </Text>
          <Box maw={456}>
            <Select
              value={category}
              onChange={(v) => v && setCategory(v as Category)}
              data={CATEGORY_OPTIONS}
              mb="md"
              rightSection={<IconChevronDown size={16} />}
            />
          </Box>
          <Box
            style={{ borderBottom: "1px solid #F0F0F0", marginBottom: 18 }}
          />

          <Text fw={500} mb={4}>
            <Text component="span" c="red" mr={4}>
              *
            </Text>
            Название
          </Text>
          <Box maw={456}>
            <ClearableInput
              value={title}
              onChange={setTitle}
              mb="sm"
              borderColor={!title ? "#FAAD14" : undefined}
            />
          </Box>
          <Box
            style={{ borderBottom: "1px solid #F0F0F0", marginBottom: 18 }}
          />

          <Text fw={500} mb={4}>
            <Text component="span" c="red" mr={4}>
              *
            </Text>
            Цена
          </Text>
          <Group align="flex-start" mb="md">
            <Box maw={456} style={{ flex: "0 0 456px" }}>
              <ClearableInput
                value={price}
                onChange={setPrice}
                borderColor={!price ? "#FAAD14" : undefined}
              />
            </Box>
            <Box ml={24} style={{ position: "relative" }}>
              {priceSuggestion && (
                <Box
                  p="md"
                  style={{
                    border: "1px solid #e9ecef",
                    borderRadius: 8,
                    backgroundColor: "#fff",
                    width: 332,
                    maxWidth: 332,
                    position: "absolute",
                    bottom: "100%",
                    left: 0,
                    zIndex: 100,
                    boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
                    marginBottom: 8,
                  }}
                >
                  <Text size="sm" fw={600} mb={4}>
                    Ответ AI:
                  </Text>
                  <Text size="sm" mb="sm" style={{ whiteSpace: "pre-line" }}>
                    {priceSuggestion}
                  </Text>
                  <Group>
                    <Button
                      size="xs"
                      onClick={() => {
                        const matches =
                          priceSuggestion.match(/\d[\d\s]*\d|\d+/g);
                        if (matches) {
                          const numbers = matches.map((m) =>
                            Number(m.replace(/\s/g, ""))
                          );
                          const biggest = Math.max(...numbers);
                          setPrice(String(biggest));
                        }
                        setPriceSuggestion(null);
                      }}
                    >
                      Применить
                    </Button>
                    <Button
                      size="xs"
                      variant="subtle"
                      color="gray"
                      onClick={() => setPriceSuggestion(null)}
                    >
                      Закрыть
                    </Button>
                  </Group>
                </Box>
              )}

              {priceError && (
                <Box
                  p="md"
                  style={{
                    border: "1px solid #ff4d4f",
                    borderRadius: 8,
                    backgroundColor: "#fff2f0",
                    maxWidth: 360,
                    position: "absolute",
                    bottom: "100%",
                    left: 0,
                    zIndex: 100,
                    boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
                    marginBottom: 8,
                  }}
                >
                  <Text size="sm" c="red" fw={600}>
                    Произошла ошибка при запросе к AI
                  </Text>
                  <Text size="sm" c="dimmed">
                    Попробуйте повторить запрос или закройте уведомление
                  </Text>
                  <Button
                    size="xs"
                    variant="subtle"
                    color="gray"
                    mt="xs"
                    onClick={() => setPriceError(false)}
                  >
                    Закрыть
                  </Button>
                </Box>
              )}
              <Button
                variant="none"
                fw={400}
                leftSection={"💡"}
                loading={isGettingPrice}
                onClick={handleGetPrice}
                style={{ backgroundColor: "#F9F1E6", color: "#FFA940" }}
              >
                {priceSuggestion ? "Повторить запрос" : "Узнать рыночную цену"}
              </Button>
            </Box>
          </Group>
          <Box
            style={{ borderBottom: "1px solid #F0F0F0", marginBottom: 18 }}
          />

          <Text fw={500} mb="sm">
            Характеристики
          </Text>

          {category === "electronics" && (
            <>
              <Text size="sm" mb={4}>
                Тип
              </Text>
              <Box maw={456}>
                <Select
                  value={params.type ?? null}
                  onChange={(v) => updateParam("type", v ?? "")}
                  data={[
                    { value: "phone", label: "Телефон" },
                    { value: "laptop", label: "Ноутбук" },
                    { value: "misc", label: "Другое" },
                  ]}
                  mb="sm"
                  styles={{
                    input: {
                      borderColor: !params.type ? "#FAAD14" : undefined,
                    },
                  }}
                  rightSection={<IconChevronDown size={16} />}
                />
              </Box>
              <Text size="sm" mb={4}>
                Бренд
              </Text>
              <Box maw={456}>
                <ClearableInput
                  value={params.brand ?? ""}
                  onChange={(v) => updateParam("brand", v)}
                  mb="sm"
                  borderColor={!params.brand ? "#FAAD14" : undefined}
                />
              </Box>
              <Text size="sm" mb={4}>
                Модель
              </Text>
              <Box maw={456}>
                <ClearableInput
                  value={params.model ?? ""}
                  onChange={(v) => updateParam("model", v)}
                  mb="sm"
                  borderColor={!params.model ? "#FAAD14" : undefined}
                />
              </Box>
              <Text size="sm" mb={4}>
                Цвет
              </Text>
              <Box maw={456}>
                <ClearableInput
                  value={params.color ?? ""}
                  onChange={(v) => updateParam("color", v)}
                  mb="sm"
                  borderColor={!params.color ? "#FAAD14" : undefined}
                />
              </Box>
              <Text size="sm" mb={4}>
                Состояние
              </Text>
              <Box maw={456}>
                <Select
                  value={params.condition ?? null}
                  onChange={(v) => updateParam("condition", v ?? "")}
                  data={[
                    { value: "new", label: "Новое" },
                    { value: "used", label: "Б/у" },
                  ]}
                  mb="sm"
                  styles={{
                    input: {
                      borderColor: !params.condition ? "#FAAD14" : undefined,
                    },
                  }}
                  rightSection={<IconChevronDown size={16} />}
                />
              </Box>
            </>
          )}

          {category === "auto" && (
            <>
              <Text size="sm" mb={4}>
                Бренд
              </Text>
              <Box maw={456}>
                <ClearableInput
                  value={params.brand ?? ""}
                  onChange={(v) => updateParam("brand", v)}
                  mb="sm"
                  borderColor={!params.brand ? "#FAAD14" : undefined}
                />
              </Box>
              <Text size="sm" mb={4}>
                Модель
              </Text>
              <Box maw={456}>
                <TextInput
                  value={params.model ?? ""}
                  onChange={(e) => updateParam("model", e.currentTarget.value)}
                  mb="sm"
                  styles={{
                    input: {
                      borderColor: !params.model ? "#FAAD14" : undefined,
                    },
                  }}
                />
              </Box>
              <Text size="sm" mb={4}>
                Год выпуска
              </Text>
              <Box maw={456}>
                <TextInput
                  value={params.yearOfManufacture ?? ""}
                  onChange={(e) =>
                    updateParam("yearOfManufacture", e.currentTarget.value)
                  }
                  mb="sm"
                  type="number"
                  styles={{
                    input: {
                      borderColor: !params.yearOfManufacture
                        ? "#FAAD14"
                        : undefined,
                    },
                  }}
                />
              </Box>
              <Text size="sm" mb={4}>
                Коробка передач
              </Text>
              <Box maw={456}>
                <Select
                  value={params.transmission ?? null}
                  onChange={(v) => updateParam("transmission", v ?? "")}
                  data={[
                    { value: "automatic", label: "Автомат" },
                    { value: "manual", label: "Механика" },
                  ]}
                  mb="sm"
                  styles={{
                    input: {
                      borderColor: !params.transmission ? "#FAAD14" : undefined,
                    },
                  }}
                  rightSection={<IconChevronDown size={16} />}
                />
              </Box>
              <Text size="sm" mb={4}>
                Пробег
              </Text>
              <Box maw={456}>
                <TextInput
                  value={params.mileage ?? ""}
                  onChange={(e) =>
                    updateParam("mileage", e.currentTarget.value)
                  }
                  mb="sm"
                  type="number"
                  styles={{
                    input: {
                      borderColor: !params.mileage ? "#FAAD14" : undefined,
                    },
                  }}
                />
              </Box>
              <Text size="sm" mb={4}>
                Мощность двигателя
              </Text>
              <Box maw={456}>
                <TextInput
                  value={params.enginePower ?? ""}
                  onChange={(e) =>
                    updateParam("enginePower", e.currentTarget.value)
                  }
                  mb="sm"
                  type="number"
                  styles={{
                    input: {
                      borderColor: !params.enginePower ? "#FAAD14" : undefined,
                    },
                  }}
                />
              </Box>
            </>
          )}

          {category === "real_estate" && (
            <>
              <Text size="sm" mb={4}>
                Тип
              </Text>
              <Box maw={456}>
                <Select
                  value={params.type ?? null}
                  onChange={(v) => updateParam("type", v ?? "")}
                  data={[
                    { value: "flat", label: "Квартира" },
                    { value: "house", label: "Дом" },
                    { value: "room", label: "Комната" },
                  ]}
                  mb="sm"
                  styles={{
                    input: {
                      borderColor: !params.type ? "#FAAD14" : undefined,
                    },
                  }}
                  rightSection={<IconChevronDown size={16} />}
                />
              </Box>
              <Text size="sm" mb={4}>
                Адрес
              </Text>
              <Box maw={456}>
                <TextInput
                  value={params.address ?? ""}
                  onChange={(e) =>
                    updateParam("address", e.currentTarget.value)
                  }
                  mb="sm"
                  styles={{
                    input: {
                      borderColor: !params.address ? "#FAAD14" : undefined,
                    },
                  }}
                />
              </Box>
              <Text size="sm" mb={4}>
                Площадь
              </Text>
              <Box maw={456}>
                <TextInput
                  value={params.area ?? ""}
                  onChange={(e) => updateParam("area", e.currentTarget.value)}
                  mb="sm"
                  type="number"
                  styles={{
                    input: {
                      borderColor: !params.area ? "#FAAD14" : undefined,
                    },
                  }}
                />
              </Box>
              <Text size="sm" mb={4}>
                Этаж
              </Text>
              <Box maw={456}>
                <TextInput
                  value={params.floor ?? ""}
                  onChange={(e) => updateParam("floor", e.currentTarget.value)}
                  mb="sm"
                  type="number"
                  styles={{
                    input: {
                      borderColor: !params.floor ? "#FAAD14" : undefined,
                    },
                  }}
                />
              </Box>
            </>
          )}

          <Box
            style={{
              borderBottom: "1px solid #F0F0F0",
              marginBottom: 18,
              marginTop: 18,
            }}
          />

          <Text fw={500} mb={4}>
            Описание
          </Text>
          <Textarea
            value={description}
            onChange={(e) => setDescription(e.currentTarget.value)}
            maxLength={1000}
            minRows={4}
            mb={4}
          />

          {descriptionSuggestion && (
            <Box
              mt="sm"
              mb="sm"
              p="md"
              style={{
                border: "1px solid #e9ecef",
                borderRadius: 8,
                backgroundColor: "#fff",
              }}
            >
              <Text size="sm" fw={600} mb={4}>
                Ответ AI:
              </Text>
              <Text size="sm" mb="sm" style={{ whiteSpace: "pre-line" }}>
                {descriptionSuggestion}
              </Text>
              <Group>
                <Button
                  size="xs"
                  onClick={() => {
                    setDescription(descriptionSuggestion);
                    setDescriptionSuggestion(null);
                  }}
                >
                  Применить
                </Button>
                <Button
                  size="xs"
                  variant="subtle"
                  color="gray"
                  onClick={() => setDescriptionSuggestion(null)}
                >
                  Закрыть
                </Button>
              </Group>
            </Box>
          )}
          {descriptionError && (
            <Box
              mt="sm"
              mb="sm"
              p="md"
              style={{
                border: "1px solid #ff4d4f",
                borderRadius: 8,
                backgroundColor: "#fff2f0",
              }}
            >
              <Text size="sm" c="red" fw={600}>
                Произошла ошибка при запросе к AI
              </Text>
              <Text size="sm" c="dimmed">
                Попробуйте повторить запрос или закройте уведомление
              </Text>
              <Button
                size="xs"
                variant="subtle"
                color="gray"
                mt="xs"
                onClick={() => setDescriptionError(false)}
              >
                Закрыть
              </Button>
            </Box>
          )}

          <Group justify="space-between" mb="md" mt="sm">
            <Button
              variant="none"
              fw={400}
              leftSection={"💡"}
              loading={isImprovingDescription}
              onClick={handleImproveDescription}
              style={{ backgroundColor: "#F9F1E6", color: "#FFA940" }}
            >
              {description ? "Улучшить описание" : "Придумать описание"}
            </Button>
            <Text size="xs" c="dimmed">
              {description.length} / 1000
            </Text>
          </Group>

          <Group mt="md">
            <Button
              onClick={() => mutate()}
              loading={isPending}
              disabled={!isValid}
            >
              Сохранить
            </Button>
            <Button
              variant="subtle"
              color="#5A5A5A"
              onClick={() => navigate(`/ads/${id}`)}
              style={{ backgroundColor: "#D9D9D9" }}
            >
              Отменить
            </Button>
          </Group>
        </Box>
      </Container>
    </Box>
  );
}
