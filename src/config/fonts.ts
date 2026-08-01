import localFont from 'next/font/local'

export const grotesk = localFont({
  src: [
    {
      path: '../../public/fonts/MTVGravityGroteskLight.ttf',
      weight: '400',
      style: 'normal',
    },
    {
      path: '../../public/fonts/MTVGravityGroteskBook.ttf',
      weight: '500',
      style: 'normal',
    },
    {
      path: '../../public/fonts/MTVGravityGroteskBold.ttf',
      weight: '700',
      style: 'normal',
    },
  ],
  variable: '--font-grotesk',
  display: 'swap',
})
