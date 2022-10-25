import { loopXTimes } from '@utils/loopXTimes'
import { AccountList } from '.'

export const LoadingList = (props: {
  listItems: number
  bgClassName?: string
  className?: string
}) => (
  <AccountList className={props.className} bgClassName={props.bgClassName}>
    {loopXTimes(props.listItems, (i) => (
      <li
        key={`loading-list-${i}`}
        className='rounded-lg bg-white bg-opacity-20 dark:bg-actually-black dark:bg-opacity-10 animate-pulse w-full h-10'
      />
    ))}
  </AccountList>
)

LoadingList.defaultProps = {
  listItems: 3
}
