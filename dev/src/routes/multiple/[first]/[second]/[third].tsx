import { useParams } from '@solidjs/router'
const Slug = () => {
  const params = useParams()
  return (
    <div id="params">
      {params.first} {params.second}
    </div>
  )
}
export default Slug
