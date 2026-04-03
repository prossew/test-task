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

const CATEGORY_OPTIONS = [
  { value: "auto", label: "Авто" },
  { value: "real_estate", label: "Недвижимость" },
  { value: "electronics", label: "Электроника" },
];

export default function AdEditPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const { data: item, isLoading } = useQuery({
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
      JSON.stringify({ title, price, description, params }),
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

  const updateParam = (key: string, value: string) => {
    setParams((prev) => ({ ...prev, [key]: value }));
  };

  if (isLoading)
    return (
      <Container size="xl" py="xl">
        <Loader />
      </Container>
    );

  return (
    <Box style={{ minHeight: "100vh" }}>
      <Container size="xl" py="xl">
        <Box bg="white" p="xl" style={{ borderRadius: 8, maxWidth: 760 }}>
          <Title order={1} fw={500} mr={10}>
            Редактирование объявления
          </Title>

          <Text fw={500} mb={4} mt={18}>
            Категория
          </Text>

          <Select
            value={category}
            onChange={(v) => v && setCategory(v as Category)}
            data={CATEGORY_OPTIONS}
            mb="md"
            w={200}
            rightSection={<IconChevronDown size={16} />}
          />
          <Box
            style={{
              borderBottom: "1px solid #F0F0F0",
              width: 700,
              margin: "0 auto",
              marginTop: "18",
            }}
          ></Box>

          <Text fw={500} mb={4} mt={18}>
            <Text component="span" c="red" mr={4}>
              *
            </Text>
            Название
          </Text>
          <ClearableInput
            value={title}
            onChange={setTitle}
            mb="sm"
            borderColor={!title ? "#FAAD14" : undefined}
          />
          <Box
            style={{
              borderBottom: "1px solid #F0F0F0",
              width: 700,
              margin: "0 auto",
              marginTop: "18px",
            }}
          ></Box>

          <Group align="flex-end" mb="md" mt={18}>
            <Box style={{ flex: 1 }}>
              <Text fw={500} mb={4}>
                <Text component="span" c="red" mr={4}>
                  *
                </Text>
                Цена
              </Text>
              <ClearableInput
                value={price}
                onChange={setPrice}
                mb="sm"
                borderColor={!price ? "#FAAD14" : undefined}
              />
            </Box>

            <Button
              variant="none"
              color="#FFA940"
              fw={400}
              leftSection={"💡"}
              style={{
                backgroundColor: "#F9F1E6",
                borderColor: "#FFA940",
                color: "#FFA940",
                marginBottom: "13px",
              }}
            >
              Узнать рыночную цену
            </Button>
          </Group>
          <Box
            style={{
              borderBottom: "1px solid #F0F0F0",
              width: 700,
              margin: "0 auto",
              marginTop: "-10px",
            }}
          ></Box>

          <Text fw={500} mb="sm" mt="md">
            Характеристики
          </Text>

          {category === "electronics" && (
            <>
              <Text size="sm" mb={4}>
                Тип
              </Text>
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
                  input: { borderColor: !params.type ? "#FAAD14" : undefined },
                }}
                rightSection={<IconChevronDown size={16} />}
              />
              <Text size="sm" mb={4}>
                Бренд
              </Text>
              <ClearableInput
                value={params.brand ?? ""}
                onChange={(v) => updateParam("brand", v)}
                mb="sm"
                borderColor={!params.brand ? "#FAAD14" : undefined}
              />
              <Text size="sm" mb={4}>
                Модель
              </Text>
              <ClearableInput
                value={params.model ?? ""}
                onChange={(v) => updateParam("model", v)}
                mb="sm"
                borderColor={!params.model ? "#FAAD14" : undefined}
              />

              <Text size="sm" mb={4}>
                Цвет
              </Text>
              <ClearableInput
                value={params.color ?? ""}
                onChange={(v) => updateParam("color", v)}
                mb="sm"
                borderColor={!params.color ? "#FAAD14" : undefined}
              />
              <Text size="sm" mb={4}>
                Состояние
              </Text>

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
            </>
          )}

          <Box
            style={{
              borderBottom: "1px solid #F0F0F0",
              width: 700,
              margin: "0 auto",
              marginTop: "18px",
            }}
          ></Box>
          {category === "auto" && (
            <>
              <Text size="sm" mb={4} mt={18}>
                Бренд
              </Text>
              <ClearableInput
                value={params.brand ?? ""}
                onChange={(v) => updateParam("brand", v)}
                mb="sm"
                borderColor={!params.brand ? "#FAAD14" : undefined}
              />

              <Text size="sm" mb={4}>
                Модель
              </Text>
              <TextInput
                value={params.model ?? ""}
                onChange={(e) => updateParam("model", e.currentTarget.value)}
                mb="sm"
                styles={{
                  input: { borderColor: !params.model ? "#FAAD14" : undefined },
                }}
              />
              <Text size="sm" mb={4}>
                Год выпуска
              </Text>
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
              <Text size="sm" mb={4}>
                Коробка передач
              </Text>
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
              />
              <Text size="sm" mb={4}>
                Пробег
              </Text>
              <TextInput
                value={params.mileage ?? ""}
                onChange={(e) => updateParam("mileage", e.currentTarget.value)}
                mb="sm"
                type="number"
                styles={{
                  input: {
                    borderColor: !params.mileage ? "#FAAD14" : undefined,
                  },
                }}
              />
              <Text size="sm" mb={4}>
                Мощность двигателя
              </Text>
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
            </>
          )}

          {category === "real_estate" && (
            <>
              <Text size="sm" mb={4}>
                Тип
              </Text>
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
                  input: { borderColor: !params.type ? "#FAAD14" : undefined },
                }}
              />
              <Text size="sm" mb={4}>
                Адрес
              </Text>
              <TextInput
                value={params.address ?? ""}
                onChange={(e) => updateParam("address", e.currentTarget.value)}
                mb="sm"
                styles={{
                  input: {
                    borderColor: !params.address ? "#FAAD14" : undefined,
                  },
                }}
              />
              <Text size="sm" mb={4}>
                Площадь
              </Text>
              <TextInput
                value={params.area ?? ""}
                onChange={(e) => updateParam("area", e.currentTarget.value)}
                mb="sm"
                type="number"
                styles={{
                  input: { borderColor: !params.area ? "#FAAD14" : undefined },
                }}
              />
              <Text size="sm" mb={4}>
                Этаж
              </Text>
              <TextInput
                value={params.floor ?? ""}
                onChange={(e) => updateParam("floor", e.currentTarget.value)}
                mb="sm"
                type="number"
                styles={{
                  input: { borderColor: !params.floor ? "#FAAD14" : undefined },
                }}
              />
            </>
          )}

          <Text fw={500} mb={4} mt="md">
            Описание
          </Text>
          <Textarea
            value={description}
            onChange={(e) => setDescription(e.currentTarget.value)}
            maxLength={1000}
            minRows={4}
            mb={4}
          />
          <Group justify="space-between" mb="md">
            <Button
              variant="none"
              color="#FFA940"
              fw={400}
              leftSection={"💡"}
              style={{
                backgroundColor: "#F9F1E6",
                borderColor: "#FFA940",
                color: "#FFA940",
              }}
            >
              Улучшить описание
            </Button>

            <Text size="xs" c="dimmed">
              {description.length} / 1000
            </Text>
          </Group>

          <Group>
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
              style={{
                backgroundColor: "#D9D9D9",
              }}
            >
              Отменить
            </Button>
          </Group>
        </Box>
      </Container>
    </Box>
  );
}
