import HeadphonesOutlinedIcon from "@mui/icons-material/HeadphonesOutlined"
import { Box, Typography } from "@mui/material"

type Props = {
   title: string
   subtitle: string
}

export default function Header({ title, subtitle }: Props) {
   return (
      <Box className="flex items-start gap-4">
         <Box className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-blue-50 text-blue-600">
            <HeadphonesOutlinedIcon className="text-[28px]" />
         </Box>

         <Box>
            <Typography
               className="text-content! text-[26px]! leading-[1.2]! font-bold! tracking-[-0.02em]!"
               component="h1">
               {title}
            </Typography>

            <Typography className="mt-1.5! text-sm!" color="textSecondary">
               {subtitle}
            </Typography>
         </Box>
      </Box>
   )
}
