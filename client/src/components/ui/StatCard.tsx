import { motion } from 'framer-motion'
import { type LucideIcon } from 'lucide-react'

interface Props {
  label: string
  value: string
  icon: LucideIcon
  color?: string
  iconBg?: string
  subtitle?: string
  positive?: boolean
}

export default function StatCard({ label, value, icon: Icon, color = 'text-brand-cyan', iconBg = 'bg-brand-cyan/10', subtitle, positive }: Props) {
  return (
    <motion.div
      whileHover={{ y: -3, transition: { duration: 0.2 } }}
      className="glass-card-hover p-4 sm:p-5"
    >
      <div className="flex items-center justify-between mb-2 sm:mb-3">
        <span className="text-[10px] sm:text-[11px] font-semibold text-brand-silver uppercase tracking-wider">
          {label}
        </span>
        <div className={`w-8 h-8 sm:w-9 sm:h-9 rounded-lg ${iconBg} flex items-center justify-center`}>
          <Icon className={`w-4 h-4 ${color}`} />
        </div>
      </div>
      <p className={`text-xl sm:text-2xl font-mono font-bold ${color}`}>{value}</p>
      {subtitle && (
        <p className={`text-[10px] sm:text-xs mt-1 ${positive === undefined ? 'text-brand-silver' : positive ? 'text-brand-profit' : 'text-brand-loss'}`}>
          {subtitle}
        </p>
      )}
    </motion.div>
  )
}
