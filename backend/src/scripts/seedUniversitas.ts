import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  const universitas = [
    'Universitas Indonesia',
    'Universitas Gadjah Mada',
    'Institut Teknologi Bandung',
    'Universitas Diponegoro',
    'Universitas Sebelas Maret',
    'Universitas Airlangga',
    'Universitas Brawijaya',
    'Universitas Padjadjaran',
    'Universitas Negeri Jakarta',
    'Universitas Negeri Yogyakarta',
    'Universitas Negeri Semarang',
    'Universitas Negeri Surabaya',
    'Universitas Negeri Malang',
    'Universitas Negeri Medan',
    'Universitas Negeri Padang',
    'Universitas Negeri Makassar',
    'Universitas Andalas',
    'Universitas Sumatera Utara',
    'Universitas Sriwijaya',
    'Universitas Lampung',
    'Universitas Riau',
    'Universitas Jambi',
    'Universitas Bangka Belitung',
    'Universitas Bengkulu',
    'Universitas Tanjungpura',
    'Universitas Palangka Raya',
    'Universitas Lambung Mangkurat',
    'Universitas Mulawarman',
    'Universitas Samarinda',
    'Universitas Borneo Tarakan',
    'Universitas Hasanuddin',
    'Universitas Tadulako',
    'Universitas Sam Ratulangi',
    'Universitas Pattimura',
    'Universitas Khairun',
    'Universitas Papua',
    'Universitas Cenderawasih',
    'Universitas Musamus',
    'Universitas Syiah Kuala',
    'Universitas Malikussaleh',
    'Universitas Teuku Umar',
    'Universitas Samudra',
    'Universitas Siliwangi',
    'Universitas Galuh',
    'Universitas Singaperbangsa Karawang',
    'Universitas Sultan Ageng Tirtayasa',
    'Universitas Trunojoyo Madura',
    'Universitas Mataram',
    'Universitas Nusa Cendana',
    'Universitas Timor',
    'Universitas Halu Oleo',
    'Universitas Negeri Gorontalo',
    'Universitas Negeri Manado',
    'Universitas Negeri Ambon',
    'Institut Teknologi Sepuluh Nopember',
    'Institut Teknologi Sumatera',
    'Institut Teknologi Kalimantan',
    'Institut Seni Indonesia Yogyakarta',
    'Institut Seni Indonesia Surakarta',
    'Institut Seni Indonesia Denpasar',
    'Institut Seni Budaya Indonesia Aceh',
    'Institut Seni Budaya Indonesia Bandung',
    'Politeknik Negeri Jakarta',
    'Politeknik Negeri Bandung',
    'Politeknik Negeri Semarang',
    'Politeknik Negeri Malang',
    'Politeknik Negeri Sriwijaya',
    'Politeknik Negeri Bali',
  ]

  for (const namaUniversitas of universitas) {
    await prisma.prodi.create({
      data: {
        nama: 'Umum',
        universitas: namaUniversitas,
      },
    })
  }
}

main()
  .then(async () => {
    await prisma.$disconnect()
  })
  .catch(async (e) => {
    console.error(e)
    await prisma.$disconnect()
    process.exit(1)
  })
