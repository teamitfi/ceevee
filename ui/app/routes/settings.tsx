import { Box, Container } from '@radix-ui/themes';

const Settings = () => {
  return (
    <div>
      <h1 className="text-2xl font-bold mb-4">Settings</h1>
      <div className="bg-slate-800 p-6 rounded">
        <Box style={{ borderRadius: 'var(--radius-3)' }}>
          <Container size="1" />
        </Box>
      </div>
    </div>
  );
};

export default Settings;
