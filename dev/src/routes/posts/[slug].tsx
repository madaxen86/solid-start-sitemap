import { useParams } from '@solidjs/router'
const Slug = () => {
  const params = useParams()
  return <div id="params">{params.slug}</div>
}
export default Slug
