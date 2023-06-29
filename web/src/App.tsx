import { useState } from "react";
import Layout from "./components/Layout";
import ShiftCalendar from "./components/ShiftCalendar";
import {
  Alert,
  AlertDescription,
  AlertIcon,
  Container,
  Input,
  Spinner,
} from "@chakra-ui/react";
import { useDebounce } from "use-debounce";
import { useQuery } from "@tanstack/react-query";
import api from "./api";

const App = () => {
  const [workerId, setWorkerId] = useState<string>("");
  const [debouncedWorkerId] = useDebounce(workerId, 1000);

  const query = useQuery({
    queryKey: ["shifts", { workerId: debouncedWorkerId }],
    queryFn: () => api.shifts.find({ workerId: Number(debouncedWorkerId) }),
    enabled: !!workerId,
  });

  return (
    <Layout>
      <Container padding={"10"}>
        <Input
          placeholder="Worker Id (try 101)"
          type="number"
          value={workerId}
          onChange={(e) => setWorkerId(e.target.value)}
          size="md"
          color={"black"}
        />

        <Container padding={"10"} centerContent>
          {query.isFetching && <Spinner size="md" />}
          {query.isError && (
            <Alert status="error">
              <AlertIcon />
              <AlertDescription>{query.error.message}</AlertDescription>
            </Alert>
          )}
        </Container>
      </Container>

      {query.isSuccess && <ShiftCalendar shifts={query.data} />}
    </Layout>
  );
};
export default App;
