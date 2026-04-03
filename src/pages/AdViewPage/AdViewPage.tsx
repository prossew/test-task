import {
  Box,
  Button,
  Container,
  Grid,
  Group,
  Image,
  Loader,
  Text,
  Title,
} from "@mantine/core";
import { IconEdit } from "@tabler/icons-react";
import { useQuery } from "@tanstack/react-query";
import { useNavigate, useParams } from "react-router-dom";
import { getItemById } from "../../api/itemsApi";

const PARAM_LABELS: Record<string, string> = {
  brand: "Бренд",
  model: "Модель",
  type: "Тип",
  color: "Цвет",
  condition: "Состояние",
  yearOfManufacture: "Год выпуска",
  transmission: "Коробка передач",
  mileage: "Пробег",
  enginePower: "Мощность двигателя",
  address: "Адрес",
  area: "Площадь",
  floor: "Этаж",
};

const PARAM_VALUES: Record<string, string> = {
  automatic: "Автомат",
  manual: "Механика",
  new: "Новое",
  used: "Б/у",
  flat: "Квартира",
  house: "Дом",
  room: "Комната",
  phone: "Телефон",
  laptop: "Ноутбук",
  misc: "Другое",
};
const FALLBACK_IMG =
  "https://media.istockphoto.com/id/1980276924/ru/%D0%B2%D0%B5%D0%BA%D1%82%D0%BE%D1%80%D0%BD%D0%B0%D1%8F/%D0%BD%D0%B5%D1%82-%D0%B3%D1%80%D0%B0%D1%84%D0%B8%D1%87%D0%B5%D1%81%D0%BA%D0%BE%D0%B3%D0%BE-%D1%8D%D0%BB%D0%B5%D0%BC%D0%B5%D0%BD%D1%82%D0%B0-%D0%BC%D0%B8%D0%BD%D0%B8%D0%B0%D1%82%D1%8E%D1%80%D1%8B-%D1%84%D0%BE%D1%82%D0%BE%D0%B3%D1%80%D0%B0%D1%84%D0%B8%D0%B8-%D0%B2-%D0%B3%D0%B0%D0%BB%D0%B5%D1%80%D0%B5%D0%B5-%D0%B8%D0%BB%D0%B8-%D0%B0%D0%BB%D1%8C%D0%B1%D0%BE%D0%BC%D0%B5-%D0%BD%D0%B5%D1%82-%D0%BD%D0%B0%D0%B9%D0%B4%D0%B5%D0%BD%D0%BD%D0%BE%D0%B3%D0%BE-%D0%B8%D0%BB%D0%B8.jpg?s=612x612&w=0&k=20&c=Uyer4BYXPwDhqbqI_8LGAVDpH_qog-ih6CzGnxvZhLY=";

function formatDate(dateStr: string) {
  return new Date(dateStr).toLocaleString("ru-RU", {
    day: "numeric",
    month: "long",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export default function AdViewPage() {
  const { id } = useParams();
  const navigate = useNavigate();

  const {
    data: item,
    isLoading,
    isError,
  } = useQuery({
    queryKey: ["item", id],
    queryFn: () => getItemById(id!),
    enabled: !!id,
  });

  if (isLoading) {
    return (
      <Container size="xl" py="xl">
        <Group justify="center" mt="xl">
          <Loader />
        </Group>
      </Container>
    );
  }

  if (isError || !item) {
    return (
      <Container size="xl" py="xl">
        <Text c="red" ta="center">
          Ошибка загрузки объявления
        </Text>
      </Container>
    );
  }

  const emptyFields: string[] = Object.entries(item.params)
    .filter(([, v]) => v === undefined || v === null || v === "")
    .map(([k]) => PARAM_LABELS[k] ?? k);

  if (!item.description || item.description.trim() === "") {
    emptyFields.push("Описание");
  }

  return (
    <Box style={{ minHeight: "100vh" }}>
      {/* Шапка */}
      <Box bg="#F7F5F8" py="xl">
        <Container size="xl">
          <Group justify="space-between" align="flex-start">
            <Box>
              <Title order={1} fw={700}>
                {item.title}
              </Title>
              <Button
                mt="sm"
                rightSection={<IconEdit size={16} />}
                onClick={() => navigate(`/ads/${id}/edit`)}
              >
                Редактировать
              </Button>
            </Box>
            <Box ta="right">
              <Title order={2} fw={700}>
                {item.price?.toLocaleString("ru-RU")} ₽
              </Title>
              <Text size="sm" c="dimmed" mt={4}>
                Опубликовано: {formatDate(item.createdAt)}
              </Text>
              {item.updatedAt && (
                <Text size="sm" c="dimmed">
                  Отредактировано: {formatDate(item.updatedAt)}
                </Text>
              )}
            </Box>
          </Group>
        </Container>
      </Box>
      <Box
        style={{
          borderBottom: "2px solid #F0F0F0",
          width: 1300,
          margin: "0 auto",
        }}
      ></Box>

      {/* Контент */}
      <Container size="xl" py="xl">
        <Grid>
          {/* Левая колонка — фото */}
          <Grid.Col span={4}>
            <Image
              src={null}
              fallbackSrc={FALLBACK_IMG}
              radius={16}
              alt={item.title}
            />
            <Title order={4} mt="xl" mb="sm" fz={20} fw={500}>
              Описание
            </Title>
            <Text size="sm">{item.description ?? "Отсутствует"}</Text>
          </Grid.Col>

          <Grid.Col span={7} ml={32}>
            {emptyFields.length > 0 && (
              <Box
                p="md"
                mb="md"
                style={{
                  backgroundColor: "#F9F1E6",
                  border: "none",
                  boxShadow:
                    "0px 9px 28px 8px rgba(0,0,0,0.05), 0px 6px 16px 0px rgba(0,0,0,0.08)",
                  borderRadius: 8,
                }}
              >
                <Group gap={8} mb={8}>
                  <Box
                    style={{
                      width: 16,
                      height: 16,
                      borderRadius: "50%",
                      backgroundColor: "#FFA940",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      flexShrink: 0,
                      color: "white",
                      fontSize: 10,
                      fontWeight: 700,
                    }}
                  >
                    !
                  </Box>
                  <Text fw={600}>Требуются доработки</Text>
                </Group>
                <Text size="sm" c="#000000D9" mb={4} ml={50}>
                  У объявления не заполнены поля:
                </Text>
                {emptyFields.map((field) => (
                  <Text key={field} size="sm" ml={50}>
                    • {field}
                  </Text>
                ))}
              </Box>
            )}

            {/* Характеристики */}
            <Title order={4} mb="sm" mt={36}>
              Характеристики
            </Title>
            {Object.entries(item.params)
              .filter(([, v]) => v !== undefined && v !== null && v !== "")
              .map(([key, value]) => (
                <Grid key={key} mb={8}>
                  <Grid.Col span={5}>
                    <Text c="dimmed" size="sm">
                      {PARAM_LABELS[key] ?? key}
                    </Text>
                  </Grid.Col>
                  <Grid.Col span={7}>
                    <Text size="sm">
                      {PARAM_VALUES[String(value)] ?? String(value)}
                    </Text>
                  </Grid.Col>
                </Grid>
              ))}

            {/* Описание */}
          </Grid.Col>
        </Grid>

        {/* Кнопка назад */}
        <Button
          variant="subtle"
          color="gray"
          mt="xl"
          onClick={() => navigate("/ads")}
        >
          ← Назад к списку
        </Button>
      </Container>
    </Box>
  );
}
