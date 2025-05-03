import React, {useState} from 'react';
import {Button} from '../../components/ui/button';
import API from '../../services/api';
import {useToast} from '../../hooks/use-toast';

const BackupButton: React.FC = () => {
    const [isLoading, setIsLoading] = useState(false);
    const {toast} = useToast();

    const handleBackup = async () => {
        setIsLoading(true);
        try {
            const response = await API.post('/api/admin/backup/create', {}, {
                responseType: 'blob',
            });

            const blob = new Blob([response.data], {type: 'application/octet-stream'});
            const url = window.URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', `backup_${new Date().toISOString()}.sql`);
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            window.URL.revokeObjectURL(url);

            toast({
                title: 'Backup creado exitosamente',
                description: 'La descarga comenzará en breve.',
            });
        } catch (error: any) {
            toast({
                title: 'Error al crear el backup',
                description: error.message || 'Hubo un problema al crear el backup.',
                variant: 'destructive',
            });
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <Button onClick={handleBackup} disabled={isLoading}>
            {isLoading ? 'Creando Backup...' : 'Crear Backup'}
        </Button>
    );
};

export default BackupButton;
