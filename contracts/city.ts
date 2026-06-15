export interface CityDto {
  id: string
  name: string
  /** Координаты + часовой пояс — для натальной карты (есть у основных городов). */
  lat?: number
  lon?: number
  tz?: number
}
